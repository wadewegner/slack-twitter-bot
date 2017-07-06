const request = require('request');

const sentimentUrl = 'https://api.einstein.ai/v2/language/sentiment';

exports.getSentiment = (accessToken, tweetText) => {

  const sentimentFormData = {
    modelId: 'CommunitySentiment',
    document: tweetText
  };

  const options = {
    url: sentimentUrl,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    formData: sentimentFormData
  };

  return new Promise((resolve, reject) => {

    request.post(options, (error, response, body) => {
      if (error) {
        resolve(reject);
      } else {
        resolve(body);
      }
    });

  });
};

exports.getSentimentFace = (sentimentBody) => {

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

  return sentiment_face;

};