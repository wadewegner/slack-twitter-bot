const Pool = require('pg-pool');
const dbUrl = require('url');

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

const pool = new Pool(config);

exports.getRecentTweetsFromDb = () => {

  return new Promise((resolve) => {

    const selectQuery = 'SELECT id, id_str, url FROM posted_tweets WHERE created_at > current_timestamp - interval \'2 day\';';

    pool.query(selectQuery, (queryErr, result) => {
      if (queryErr) {
        resolve(queryErr);
      }
      resolve(result);
    });
  });
};

exports.getTweetIdsWithoutTextOrLangFromDb = (type) => {

  return new Promise((resolve) => {

    let selectQuery;
    if (type === 1) {
      selectQuery = 'SELECT id_str FROM posted_tweets WHERE tweet_text is null;';
    } else {
      selectQuery = 'SELECT id_str FROM posted_tweets WHERE lang is null;';
    }

    pool.query(selectQuery, (queryErr, result) => {
      if (queryErr) {
        console.error('postgres query', queryErr);
        resolve(queryErr);
      }
      resolve(result);
    });
  });
};

exports.insertTweet = (insertQuery, local) => {

  return new Promise((resolve) => {

    if (local === 'false') {
      pool.query(insertQuery, (insertErr) => {
        if (insertErr) {
          console.error('postgres insert', insertErr);
          resolve(insertErr);
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

exports.updateTweetText = (updateQuery) => {

  return new Promise((resolve) => {

    pool.query(updateQuery, (insertErr) => {
      if (insertErr) {
        resolve(insertErr);
      }
      resolve();
    });
  });
};