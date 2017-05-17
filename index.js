const Bot = require('slackbots');
const Twit = require('twit');
// const Pool = require('pg').Pool;
const Pool = require('pg-pool');
const moment = require('moment');

const config = {
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  ssl: true,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
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

bot.on('start', () => {

  console.log('Starting bot service ...'); // eslint-disable-line no-console

  // bot.postMessageToChannel('salesforcedxeyes', 'Reporting for service!', params);
  bot.postMessageToUser('wadewegner', 'Reporting for service!', params);

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
        count: 100
      }, (twitterErr, data) => {

        if (twitterErr) {
          return onError(twitterErr, 'twitter');
        }

        for (const tweet in data.statuses) {

          const screen_name = data.statuses[tweet].user.screen_name;
          const id = data.statuses[tweet].id_str;
          const url = `https://twitter.com/${screen_name}/status/${id}`;

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
              bot.postMessageToChannel('salesforcedxeyes', `I found a tweet! ${url}`, params);
            });
          }
        }
      });
    });
  }, the_interval);
});