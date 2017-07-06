const einsteinTokenHelper = require('./lib/einstein_auth.js');
const einsteinSentimentHelper = require('./lib/einstein_sentiment.js');
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

    postgresHelper.getTweetsFromDb().then((result) => {
      twitterHelper.searchTweets().then((twitterData) => {

        for (const tweet in twitterData.statuses) {

          const screen_name = twitterData.statuses[tweet].user.screen_name;
          const id = twitterData.statuses[tweet].id_str;
          const url = `https://twitter.com/${screen_name}/status/${id}`;
          const tweetText = twitterData.statuses[tweet].text;
          const exists = twitterHelper.checkExists(result, id);

          if (!exists) {
            console.log(`Doesn't exist: ${url}`); // eslint-disable-line no-console
            const insertQuery = `INSERT INTO posted_tweets (url, id_str) VALUES ('${url}', '${id}')`;

            postgresHelper.insertTweet(insertQuery).then(() => {
              einsteinTokenHelper.getAccessToken().then((accessToken) => {
                einsteinSentimentHelper.getSentiment(accessToken, tweetText).then((responseBody) => {

                  const sentimentBody = JSON.parse(responseBody);

                  if (sentimentBody.message) {
                    slackHelper.handleMessage(bot, 'salesforcedxeyes', `I found a tweet! ${url}`, local);
                  } else {
                    const sentiment_face = einsteinSentimentHelper.getSentimentFace(sentimentBody);
                    slackHelper.handleMessage(bot, 'salesforcedxeyes', `I found a ${sentiment_face} tweet! ${url}`, local);
                  }
                });
              });
            });
          }
        }
      });
    });
  }, the_interval);
});