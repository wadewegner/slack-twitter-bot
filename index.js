const Bot = require('slackbots');
const Twit = require('twit');
const Pool = require('pg').Pool;
const moment = require('moment');
const sleep = require('sleep');

const config = {
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  ssl: true,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
};

const pool = new Pool(config);

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

const bot = new Bot(settings);

bot.on('start', () => {

  const params = {
    icon_emoji: ':beers:'
  };

  console.log('Starting bot service ...'); // eslint-disable-line no-console

  bot.postMessageToChannel('salesforcedxeyes', 'Reporting for service!', params);

  const minutes = process.env.LOOPINTERVAL;
  const the_interval = minutes * 60 * 1000;

  setInterval(() => {

    const onError = function (err, origin) {
      bot.postMessageToUser('wadewegner', `I've crashed, @WadeWegner! Help me (${origin}): ${err.message}`, params); 
      console.log(err.message, err.stack); // eslint-disable-line no-console
    };

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
        let query = `SELECT id, url FROM posted_tweets WHERE url = '${url}';`;

        sleep.sleep(1); // sleep for two seconds

        pool.query(query, (queryErr, result) => {
          if (queryErr) {np
            return onError(queryErr, 'select');
          }

          if (result.rowCount === 0) {

            console.log(`Doesn't exist: ${url}`); // eslint-disable-line no-console
            bot.postMessageToChannel('salesforcedxeyes', `I found a tweet! ${url}`, params);
            query = `INSERT INTO posted_tweets (url) VALUES ('${url}')`;

            pool.query(query, (insertErr) => {
              if (insertErr) {
                return onError(insertErr, 'insert');
              }
            });
          }
        });
      }
    });
  }, the_interval);
});