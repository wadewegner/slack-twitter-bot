const einsteinSentimentHelper = require('./einstein_sentiment.js');
const einsteinIntentHelper = require('./einstein_intent.js');

exports.formatEinsteinText = (sentimentBody, intentBody) => {

    let sentiment_face = '';
    let intent = '';
    let insertion = '';

    if (sentimentBody) {
        sentiment_face = einsteinSentimentHelper.getSentimentFace(sentimentBody);
    }
    if (intentBody) {
        intent = einsteinIntentHelper.getIntentCategory(intentBody);
    }

    if (sentiment_face) {
        insertion += sentiment_face;
    }
    if (intent) {
        if (sentiment_face) {
            insertion += ` ${intent}`;
        } else {
            insertion += intent;
        }
    }
    if ((sentiment_face !== '') || (intent !== '')) {
        insertion += ' ';
    }

    return insertion;  
};