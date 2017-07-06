let accessToken;

const jwt = require('jsonwebtoken');
const request = require('request');

const privateKey = process.env.EINSTEIN_VISION_PRIVATE_KEY;
const accountId = process.env.EINSTEIN_VISION_ACCOUNT_ID;

const reqUrl = 'https://api.metamind.io/v1/oauth2/token';

const rsaPayload = {
  'sub': accountId,
  'aud': reqUrl
};

const rsaOptions = {
  header: {
    'alg': 'RS256',
    'typ': 'JWT'
  },
  expiresIn: '500h'
};

exports.getAccessToken = () => {

  const assertion = jwt.sign(
    rsaPayload,
    privateKey,
    rsaOptions
  );

  const options = {
    url: reqUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(assertion)}`
  };

  return new Promise((resolve, reject) => {

    request.post(options, (error, response, body) => {
      if (error) {
        resolve(reject);
      } else {
        const data = JSON.parse(body);
        accessToken = data['access_token'];
        resolve(accessToken);
      }
    });

  });
};