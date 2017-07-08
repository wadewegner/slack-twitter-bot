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

exports.formatReplyMessage = (einsteinResults) => {

    let replyMessage = 'Here\'s what I think:\n\n';

    replyMessage += `*Einstein Sentiment*:\n\n
    Positive: ${this.returnPercentage(einsteinResults.positive)}
    Negative: ${this.returnPercentage(einsteinResults.negative)}
    Neutral: ${this.returnPercentage(einsteinResults.neutral)}\n\n`;
    
    replyMessage += `*Einstein Intent*:\n\n
    Info: ${this.returnPercentage(einsteinResults.info)}
    Issue: ${this.returnPercentage(einsteinResults.issue)}
    Question: ${this.returnPercentage(einsteinResults.question)}
    Badge: ${this.returnPercentage(einsteinResults.badge)}
    Excitement: ${this.returnPercentage(einsteinResults.excitement)}`;

    return replyMessage;
};

exports.returnPercentage = (prediction) => {
    const percentage = `${(prediction * 100).toFixed(1)}%`;
    return percentage;
};