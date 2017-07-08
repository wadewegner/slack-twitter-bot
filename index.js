const einsteinTokenHelper = require('./lib/einstein_auth.js');
const einsteinSentimentHelper = require('./lib/einstein_sentiment.js');
const einsteinIntentHelper = require('./lib/einstein_intent.js');
const postgresHelper = require('./lib/postgres.js');
const twitterHelper = require('./lib/twitter.js');
const slackHelper = require('./lib/slack.js');
const textFormatterHelper = require('./lib/text_formatting.js');

const the_interval = process.env.LOOPINTERVAL * 60 * 1000;
const local = process.env.LOCAL;
const bot = slackHelper.getBot();

bot.on('start', () => {

  console.log('Starting bot service ...');
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
            console.log(`Doesn't exist: ${url}`);
            tweetText = tweetText.replace(/'/g, "''");
            const insertQuery = `INSERT INTO posted_tweets (url, id_str, tweet_text) VALUES ('${url}', '${id}', '${tweetText}')`;

            postgresHelper.insertTweet(insertQuery, local).then(() => {
              einsteinTokenHelper.getAccessToken().then((accessToken) => {
                einsteinSentimentHelper.getSentiment(accessToken, tweetText).then((sentimentBody) => {
                  einsteinIntentHelper.getIntent(accessToken, tweetText).then((intentBody) => {

                    const insertion = textFormatterHelper.formatEinsteinText(sentimentBody, intentBody);
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