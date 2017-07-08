const Twit = require('twit');
const moment = require('moment');

const T = new Twit({
  consumer_key: process.env.CONSUMERKEY,
  consumer_secret: process.env.CONSUMERSECRET,
  access_token: process.env.ACCESSTOKEN,
  access_token_secret: process.env.ACCESSTOKENSECRET,
  timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests.
});

exports.getTweetById = (id) => {
  return new Promise((resolve) => {

    T.get(`statuses/show/${id}`, {
      
    }, (twitterErr, twitterData) => {

      if (twitterErr) {
        resolve(twitterErr);
      } else {
        resolve(twitterData);
      }
    });

  });
};

exports.getTweetsByIds = (ids) => {

  return new Promise((resolve) => {

    T.get('statuses/lookup', {
      id: ids
    }, (twitterErr, twitterData) => {

      if (twitterErr) {
        resolve(twitterErr);
      } else {
        resolve(twitterData);
      }
    });

  });

};

exports.searchTweets = () => {
  return new Promise((resolve, reject) => {

    const sinceDate = moment().format('YYYY-MM-D');
    const searchTerms = process.env.SEARCHTERMS;

    T.get('search/tweets', {
      q: `${searchTerms} exclude:retweets since:${sinceDate}`,
      count: process.env.SEARCHRESULTCOUNT
    }, (twitterErr, twitterData) => {

      if (twitterErr) {
        resolve(reject);
      } else {
        resolve(twitterData);
      }
    });
  });
};

exports.checkExists = (result, id) => {

  let exists = false;

  for (const row in result.rows) {
    if (result.rows[row].id_str === id) {
      exists = true;
      break;
    }
  }

  return exists;
};