const einsteinTokenHelper = require('./lib/einstein_auth.js');
const einsteinSentimentHelper = require('./lib/einstein_sentiment.js');
const einsteinIntentHelper = require('./lib/einstein_intent.js');
const postgresHelper = require('./lib/postgres.js');
const twitterHelper = require('./lib/twitter.js');
const slackHelper = require('./lib/slack.js');

const the_interval = process.env.LOOPINTERVAL * 60 * 1000;
const local = process.env.LOCAL;

const bot = slackHelper.getBot();
bot.on('start', () => {

  console.log('Starting bot service ...'); // eslint-disable-line no-console
  slackHelper.postMessageToUser(bot, 'wadewegner', `Reporting for service (local: ${local})!`);

  setInterval(() => {

    postgresHelper.getRecentTweetsFromDb().then((result) => {
      twitterHelper.searchTweets().then((twitterData) => {

        for (const tweet in twitterData.statuses) {

          const screen_name = twitterData.statuses[tweet].user.screen_name;
          const id = twitterData.statuses[tweet].id_str;
          const url = `https://twitter.com/${screen_name}/status/${id}`;
          let tweetText = twitterData.statuses[tweet].text;
          const exists = twitterHelper.checkExists(result, id);

          if (!exists) {
            console.log(`Doesn't exist: ${url}`); // eslint-disable-line no-console
            tweetText = tweetText.replace(/'/g, "''");
            const insertQuery = `INSERT INTO posted_tweets (url, id_str, tweet_text) VALUES ('${url}', '${id}', '${tweetText}')`;

            postgresHelper.insertTweet(insertQuery, local).then(() => {
              einsteinTokenHelper.getAccessToken().then((accessToken) => {
                einsteinSentimentHelper.getSentiment(accessToken, tweetText).then((sentimentResponseBody) => {
                  einsteinIntentHelper.getIntent(accessToken, tweetText).then((intentResponseBody) => {

                    const sentimentBody = JSON.parse(sentimentResponseBody);
                    const intentBody = JSON.parse(intentResponseBody);
                    let sentiment_face = '';
                    let intent = '';
                    let insertion = '';

                    if (!sentimentBody.message) {
                      sentiment_face = einsteinSentimentHelper.getSentimentFace(sentimentBody);
                    }
                    if (!intentBody.message) {
                      intent = einsteinIntentHelper.getIntentCategory(intentBody);
                    }

                    if (sentiment_face) {
                      insertion += sentiment_face;
                    }
                    if (intent) {
                      if (sentiment_face) {
                        insertion += ` ${intent}`;
                      } else {
                        insertion += intent;
                      }
                    }
                    if ((sentiment_face !== '') || (intent !== '')) {
                      insertion += ' ';
                    }
                    

                    slackHelper.handleMessage(bot, 'salesforcedxeyes', `I found a ${insertion}tweet! ${url}`, local);

                  });
                });
              });
            });
          }
        }
      });
    });
  }, the_interval);
});