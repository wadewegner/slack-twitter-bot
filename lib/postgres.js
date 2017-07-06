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
const selectQuery = 'SELECT id, id_str, url FROM posted_tweets WHERE created_at > current_timestamp - interval \'2 day\';';

exports.getTweetsFromDb = () => {

  return new Promise((resolve, reject) => {

    pool.query(selectQuery, (queryErr, result) => {
      if (queryErr) {
        resolve(reject);
      }
      resolve(result);
    });
  });
};

exports.insertTweet = (insertQuery) => {

  return new Promise((resolve, reject) => {

    pool.query(insertQuery, (insertErr) => {
      if (insertErr) {
        resolve(reject);
      }
      resolve();
    });
  });
};