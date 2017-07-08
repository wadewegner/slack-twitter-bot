const request = require('request');

exports.getIntent = (accessToken, tweetText) => {

  const intentUrl = 'https://api.einstein.ai/v2/language/intent';

  const intentFormData = {
    modelId: 'JRD2A4HVBBXZC66NQA6JNVWBGM',
    document: tweetText
  };

  const options = {
    url: intentUrl,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    formData: intentFormData
  };

  return new Promise((resolve, reject) => {

    request.post(options, (error, response, body) => {
      if (error) {
        console.error('getIntent', error);
        resolve(reject);
      } else {

        const intentBody = JSON.parse(body);
        if (intentBody.message) {
          console.error('Error with getIntent', response);
          resolve();
        }
        resolve(intentBody);
      }
    });
  });
};

exports.getIntentCategory = (results) => {

  const info = results.info;
  const issue = results.issue;
  const question = results.question;
  const badge = results.badge;
  const excitement = results.excitement;

  let intentText = '';
  let percentage;

  if (info > 0.4) {
    intentText += ' | info ';
  }
  if (issue > 0.4) {
    intentText += ' | issue ';
  }
  if (question > 0.4) {
    intentText += ' | question ';
  }
  if (badge > 0.4) {
    intentText += ' | badge ';
  }
  if (excitement > 0.4) {
    intentText += ' | excitement ';
  }

  if (intentText !== '') {
    intentText = intentText.substr(2);
    intentText = `[${intentText}]`;
  }

  return intentText;
};

exports.getIntentResults = (intentBody) => {

  const results = {};

  let info = 0;
  let issue = 0;
  let question = 0;
  let badge = 0;
  let excitement = 0;

  if (intentBody) {

    const probabilities = intentBody.probabilities;

    for (const probabilityRow in probabilities) {
      if (probabilities[probabilityRow].label === 'info') {
        info = probabilities[probabilityRow].probability;
      }
      if (probabilities[probabilityRow].label === 'issue') {
        issue = probabilities[probabilityRow].probability;
      }
      if (probabilities[probabilityRow].label === 'question') {
        question = probabilities[probabilityRow].probability;
      }
      if (probabilities[probabilityRow].label === 'badge') {
        badge = probabilities[probabilityRow].probability;
      }
      if (probabilities[probabilityRow].label === 'excitement') {
        excitement = probabilities[probabilityRow].probability;
      }
    }
  }

  results.info = info;
  results.issue = issue;
  results.question = question;
  results.badge = badge;
  results.excitement = excitement;

  return results;
};