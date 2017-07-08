const request = require('request');


exports.getSentiment = (accessToken, tweetText) => {

  const sentimentUrl = 'https://api.einstein.ai/v2/language/sentiment';

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
        console.error('getSentiment', error);
        resolve(reject);
      } else {

        const sentimentBody = JSON.parse(body);
        if (sentimentBody.message) {
          console.error('Error with getSentiment', response);
          resolve();
        }
        resolve(sentimentBody);
      }
    });
  });
};

exports.getSentimentFace = (sentimentBody) => {

  let positive = 0;
  let negative = 0;
  const probabilities = sentimentBody.probabilities;

  for (const probabilityRow in probabilities) {
    if (probabilities[probabilityRow].label === 'positive') {
      positive = probabilities[probabilityRow].probability;
    }
    if (probabilities[probabilityRow].label === 'negative') {
      negative = probabilities[probabilityRow].probability;
    }
  }

  let sentiment_face = ':neutral_face:';
  if (positive > 0.5) {
    sentiment_face = ':simple_smile:';
  }
  if (positive > 0.7) {
    sentiment_face = ':smile:';
  }
  if (negative > 0.5) {
    sentiment_face = ':angry:';
  }

  return sentiment_face;

};