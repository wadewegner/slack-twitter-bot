const Bot = require('slackbots');

const settings = {
  token: process.env.SLACKTOKEN,
  name: process.env.SLACKNAME
};

const params = {
  icon_emoji: ':beers:'
};

exports.getBot = () => {
  const bot = new Bot(settings);
  return bot;
};

exports.postMessageToUser = (bot, user, message) => {
  bot.postMessageToUser(user, message, params);
};

exports.postMessageToChannel = (bot, channel, message) => {
  bot.postMessageToChannel(channel, message, params);
};

exports.handleMessage = (bot, channel, message, local) => {
  if (local === 'true') {
    bot.postMessageToUser('wadewegner', message);
  } else {
    bot.postMessageToChannel(channel, message);
  }
};