const Bot = require('slackbots');
const Twit = require('twit');
const Pool = require('pg-pool');
const moment = require('moment');
const dbUrl = require('url');
const einsteinTokenHelper = require('./lib/einstein_auth.js');
const request = require('request');

const dbParams = dbUrl.parse(process.env.DATABASE_URL);
const auth = dbParams.auth.split(':');

const config = {
  host: dbParams.hostname,
  port: dbParams.port,
  user: auth[0],
  ssl: true,
  password: auth[1],
  database: dbParams.pathname.split('/')[1],
  idleTimeoutMillis: 1000,
  max: 10
};

const settings = {
  token: process.env.SLACKTOKEN,
  name: process.env.SLACKNAME
};

const T = new Twit({
  consumer_key: process.env.CONSUMERKEY,
  consumer_secret: process.env.CONSUMERSECRET,
  access_token: process.env.ACCESSTOKEN,
  access_token_secret: process.env.ACCESSTOKENSECRET,
  timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests.
});

const params = {
  icon_emoji: ':beers:'
};

const bot = new Bot(settings);
const minutes = process.env.LOOPINTERVAL;
const the_interval = minutes * 60 * 1000;
const local = process.env.LOCAL;

bot.on('start', () => {

  console.log('Starting bot service ...'); // eslint-disable-line no-console
  bot.postMessageToUser('wadewegner', `Reporting for service (local: ${local})!`, params);

  setInterval(() => {

    const pool = new Pool(config);

    const onError = function (err, origin) {
      bot.postMessageToUser('wadewegner', `I've crashed, @WadeWegner! Help me (${origin}): ${err.message}`, params);
      console.log(err.message, err.stack); // eslint-disable-line no-console
    };

    const selectQuery = 'SELECT id, id_str, url FROM posted_tweets WHERE created_at > current_timestamp - interval \'2 day\';';

    pool.query(selectQuery, (queryErr, result) => {
      if (queryErr) {
        return onError(queryErr, 'select');
      }

      const sinceDate = moment().format('YYYY-MM-D');
      const searchTerms = process.env.SEARCHTERMS;

      T.get('search/tweets', {
        q: `${searchTerms} exclude:retweets since:${sinceDate}`,
        count: process.env.SEARCHRESULTCOUNT
      }, (twitterErr, twitterData) => {

        if (twitterErr) {
          return onError(twitterErr, 'twitter');
        }

        for (const tweet in twitterData.statuses) {

          const screen_name = twitterData.statuses[tweet].user.screen_name;
          const id = twitterData.statuses[tweet].id_str;
          const url = `https://twitter.com/${screen_name}/status/${id}`;
          const tweetText = twitterData.statuses[tweet].text;

          let exists = false;

          for (const row in result.rows) {
            if (result.rows[row].id_str === id) {
              exists = true;
              break;
            }
          }

          if (!exists) {
            console.log(`Doesn't exist: ${url}`); // eslint-disable-line no-console
            const insertQuery = `INSERT INTO posted_tweets (url, id_str) VALUES ('${url}', '${id}')`;

            pool.query(insertQuery, (insertErr) => {
              if (insertErr) {
                return onError(insertErr, 'insert');
              }

              einsteinTokenHelper.getAccessToken().then((accessToken) => {

                const sentimentFormData = {
                  modelId: 'CommunitySentiment',
                  document: tweetText
                };

                const sentimentUrl = 'https://api.einstein.ai/v2/language/sentiment';

                const options = {
                  url: sentimentUrl,
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  },
                  formData: sentimentFormData
                };

                request.post(options, (error, response, body) => {
                  if (error) {

                    if (local === 'true') {
                      bot.postMessageToUser('wadewegner', `I found a tweet (error)! ${url}`, params);
                    } else {
                      bot.postMessageToChannel('salesforcedxeyes', `I found a tweet! ${url}`, params);
                    }

                  } else {
                    const sentimentBody = JSON.parse(body);

                    if (sentimentBody.message) {

                      if (local === 'true') {
                        bot.postMessageToUser('wadewegner', `I found a tweet (error)! ${url}`, params);
                      } else {
                        bot.postMessageToChannel('salesforcedxeyes', `I found a tweet! ${url}`, params);
                      }

                    } else {

                      const positive_probability = sentimentBody.probabilities[0].probability;
                      const negative_probability = sentimentBody.probabilities[1].probability;

                      let sentiment_face = ':neutral_face:';
                      if (positive_probability > 0.5) {
                        sentiment_face = ':simple_smile:';
                      }
                      if (positive_probability > 0.7) {
                        sentiment_face = ':smile:';
                      }
                      if (negative_probability > 0.6) {
                        sentiment_face = ':angry:';
                      }

                      if (local === 'true') {
                        bot.postMessageToUser('wadewegner', `I found a ${sentiment_face} tweet! ${url}`, params);
                      } else {
                        bot.postMessageToChannel('salesforcedxeyes', `I found a ${sentiment_face} tweet! ${url}`, params);
                      }
                    }
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