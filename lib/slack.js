const Bot = require('slackbots');

const settings = {
  token: process.env.SLACKTOKEN,
  name: process.env.SLACKNAME
};

exports.getBot = () => {
  const bot = new Bot(settings);
  return bot;
};

exports.postMessageToChannel = (bot, channel, message, replyMessage) => {

  let params = {
    icon_emoji: ':beers:',
    link_names: 'true'
  };

  bot.postMessageToChannel(channel, message, params, (messageResults) => {

    const ts = messageResults.ts;

    params = {
      icon_emoji: ':beers:',
      link_names: 'true',
      thread_ts: ts,
      mrkdwn: 'true'
    };

    bot.postMessageToChannel(channel, replyMessage, params);
  });
};