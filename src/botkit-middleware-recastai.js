const recastai = require('recastai').default;
const debug = require('debug')('botkit:middleware:recastai');
const default_minimum_confidence = 0.5;
const default_language = 'en'; // TODO: remove it since it is not used by recastai anymore

module.exports = function (options) {

    if (!options || !options.request_token) {
        throw new Error('No recast.ai API request token specified !');
    }

    const middleware = {};
    const language = options.language || default_language;
    const minimum_confidence = options.confidence || default_minimum_confidence;
    const client = new recastai.request(options.request_token);

    middleware.receive = function (bot, message, next) {
        if (!message.text) return next()

        client.analyseText(message.text)
            .then(function (res) {
                debug('recastai response', res)
                message.intents = res.intents;
                message.entities = res.entities;
                message.sentiment = res.sentiment;
                message.act = res.act;
                next();
            }).catch(function (err) {
                next(err);
            });
    };

    middleware.hears = function (patterns, message) {
        const intents_length = message.intents.length;
        const patterns_length = patterns.length;

        if (message.intents) {
            for (var i = 0; i < intents_length; i++) {
                if (patterns.indexOf(message.intents[i].slug) !== -1 && message.intents[i].confidence >= minimum_confidence) {
                    return true;
                }
            }
        }
        return false;
    };

    return middleware;

};
