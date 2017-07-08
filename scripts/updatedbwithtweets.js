const twitterHelper = require('../lib/twitter.js');
const postgresHelper = require('../lib/postgres.js');

postgresHelper.getTweetIdsWithoutTextFromDb().then((queryResults) => {

  const rows = queryResults.rows;
  let i;
  let j;
  let tempRows;
  const chunk = 100;

  for (i = 0, j = rows.length; i < j; i += chunk) {
    tempRows = rows.slice(i, i + chunk);

    let ids = '';

    for (const tempRow in tempRows) {
      ids += `${tempRows[tempRow].id_str},`;
    }
    ids = ids.substring(0, ids.length - 1);

    twitterHelper.getTweetsByIds(ids).then((twitterData) => {

      for (const tweetRow in twitterData) {
        const tweet = twitterData[tweetRow];

        let tweet_text = tweet.text;
        tweet_text = tweet_text.replace(/'/g, "''");
        const tweet_id = tweet.id_str;

        // UPDATE sometable SET somevalue = $1
        const updateQuery = `UPDATE posted_tweets SET tweet_text = '${tweet_text}' WHERE id_str = '${tweet_id}'`;

        postgresHelper.updateTweetText(updateQuery, tweet_text, tweet_id).then((updateResults) => {
          console.log(updateResults);
        });
      }
    });
  }
});