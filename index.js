const Bot = require('slackbots');
const Twit = require('twit');
const Pool = require('pg-pool');
const moment = require('moment');
const dbUrl = require('url');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

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

const nlu = new NaturalLanguageUnderstandingV1({
  username: process.env.IBMUSERNAME,
  password: process.env.IBMPASSWORD,
  version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
});

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
          const lang = twitterData.statuses[tweet].lang;

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

              nlu.analyze({
                'text': tweetText,
                'features': {
                  'sentiment': {
                    'document': true
                  },
                  'emotion': {
                    'document': true
                  }
                }
              }, (err, response) => {
                if (err) {

                  bot.postMessageToChannel('salesforcedxeyes', `I found a tweet (but couldn't understand the emotional state)! ${url}`, params);
                  bot.postMessageToUser('wadewegner', `I've crashed, @WadeWegner! Help me (BlueMix): ${err.message}`, params);
                  console.log(err.message, err.stack); // eslint-disable-line no-console

                } else {

                  const sentiment_score = response.sentiment.document.score;
                  const sentiment_label = response.sentiment.document.label;
                  const language = response.language;
                  const sadness = response.emotion.document.emotion.sadness;
                  const joy = response.emotion.document.emotion.joy;
                  const fear = response.emotion.document.emotion.fear;
                  const disgust = response.emotion.document.emotion.sadness;
                  const anger = response.emotion.document.emotion.anger;
                  const emotionOuput = `sadness: ${sadness} joy: ${joy} fear: ${fear} disgust: ${disgust} anger: ${anger}`;

                  let sentiment_face = ':neutral_face:';
                  if (sentiment_label === 'positive') {
                    sentiment_face = ':simple_smile:';
                    if (sentiment_score > .5) {
                      sentiment_face = ':smile:';
                    }
                  }
                  if (sentiment_label === 'negative') {
                    sentiment_face = ':angry:';
                  }

                  // bot.postMessageToChannel('salesforcedxeyes', `I found a ${sentiment_face} tweet! ${url}`, params);
                  bot.postMessageToUser('wadewegner', `I found a ${sentiment_face} tweet! ${url}`, params);
                }
              });
            });
          }
        }
      });
    });
  }, the_interval);
});