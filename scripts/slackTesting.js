const slackHelper = require('../lib/slack.js');

const slackChannel = process.env.SLACK_CHANNEL;
const bot = slackHelper.getBot();

// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 1: <@wadewegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 2: <@wadewegner|Wade Wegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 3: <@wadewegner|wadewegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 4: <!channel>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 5: <!channel|channel>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 6: <!wadewegner|wadewegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 7: <!wadewegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 8: <!subteam^botnotify|botnotify>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 9: <!subteam^Sbotnotify|botnotify>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 10: <@Uwadewegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 11: <@Uwadewegner|Wade Wegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 12: <!@wadewegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 13: <!@wadewegner|Wade Wegner>');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 14: @wadewegner');
// slackHelper.postMessageToChannel(bot, slackChannel, 'Test 15: @botnotify');

const message = 'I found a :neutral_face: [excitement (99.7%)] tweet! (FYI @wadewegner) https://twitter.com/Googlenetics/status/883797295673692160';

slackHelper.postMessageToChannel(bot, slackChannel, message);
