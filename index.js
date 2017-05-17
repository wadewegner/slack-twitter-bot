var Bot = require('slackbots');
var Twit = require('twit');
var Pool = require('pg').Pool;
var moment = require('moment');

var config = {
  host: process.env.HOST,
  port: 5432,
  user: process.env.USER,
  ssl: true,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};

var pool = new Pool(config);

var settings = {
  token: process.env.SLACKTOKEN,
  name: process.env.SLACKNAME
};

var T = new Twit({
  consumer_key: process.env.CONSUMERKEY,
  consumer_secret: process.env.CONSUMERSECRET,
  access_token: process.env.ACCESSTOKEN,
  access_token_secret: process.env.ACCESSTOKENSECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});

var bot = new Bot(settings);

bot.on('start', function () {

  console.log("Starting bot service ...");
  bot.postMessageToChannel('salesforcedxeyes', `Reporting for service, @WadeWegner!`);

  const minutes = process.env.LOOPINTERVAL;
  const the_interval = minutes * 60 * 1000;

  setInterval(function () {

    var onError = function (err) {
      
      bot.postMessageToChannel('salesforcedxeyes', `I've crashed, @WadeWegner! Help me: ${err.message}`);
      console.log(err.message, err.stack);
    };

    let exists = false;
    const sinceDate = moment().format('YYYY-MM-D');

    const searchTerms = process.env.SEARCHTERMS;

    T.get('search/tweets', {
      q: `${searchTerms} exclude:retweets since:${sinceDate}`,
      count: 100
    }, function (err, data, response) {

      for (let tweet in data.statuses) {

        const screen_name = data.statuses[tweet].user.screen_name;
        const id = data.statuses[tweet].id_str;
        const url = `https://twitter.com/${screen_name}/status/${id}`;

        let query = `SELECT id, url FROM posted_tweets WHERE url = '${url}';`;

        pool.query(query, function (err, result) {
          if (err) return onError(err);

          if (result.rowCount === 0) {
          
            console.log(`Doesn't exist: ${url}`);

            bot.postMessageToChannel('salesforcedxeyes', url);
            
            query = `INSERT INTO posted_tweets (url) VALUES ('${url}')`;

            pool.query(query, function (err) {
              if (err) return onError(err);
            });

          } else {
            // console.log(`Already exists: ${url}`);
          }
        });
      }
    });
  }, the_interval);
});