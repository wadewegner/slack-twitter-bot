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

exports.getIntentCategory = (intentBody) => {

  let info = 0;
  let issue = 0;
  let question = 0;
  let badge = 0;
  let excitement = 0;

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

  let intentText = '';
  let percentage;

  if (info > 0.4) {
    percentage = (info * 100).toFixed(1) + '%';
    intentText += ` | info (${percentage}) `;
  }
  if (issue > 0.4) {
    percentage = (issue * 100).toFixed(1) + '%';
    intentText += ` | issue (${percentage}) `;
  }
  if (question > 0.4) {
    percentage = (question * 100).toFixed(1) + '%';
    intentText += ` | question (${percentage}) `;
  }
  if (badge > 0.4) {
    percentage = (badge * 100).toFixed(1) + '%';
    intentText += ` | badge (${percentage}) `;
  }
  if (excitement > 0.4) {
    percentage = (excitement * 100).toFixed(1) + '%';
    intentText += ` | excitement (${percentage}) `;
  }
  
  if (intentText !== '') {
    intentText = intentText.substr(3);
    intentText = intentText.substring(0, intentText.length - 1);
    intentText = `[${intentText}]`;
  }

  return intentText;
};