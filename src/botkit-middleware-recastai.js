var recastai = require('recastai');
var default_minimum_confidence = 0.5;
var default_language = 'en';

module.exports = function (options) {

    if (!options || !options.request_token) {
        throw new Error('No recast.ai API request token specified !');
    }

    var middleware = {};
    var language = options.language || default_language;
    var minimum_confidence = options.confidence || default_minimum_confidence;
    var client = new recastai.Client(options.request_token, language);

    middleware.receive = function (bot, message, next) {
        if (message.text) {
            client.textRequest(message.text)
                .then(function (res) {
                    console.log(JSON.stringify(res));
                    message.intents = res.intents;
                    message.entities = res.entities;
                    message.sentiment = res.sentiment;
                    message.act = res.act;
                    next();
                }).catch(function (err) {
                    next(err);
                });
        } else {
            next();
        }
    };

    middleware.hears = function (patterns, message) {
        if (message.intents) {
            for (var i = 0; i < message.intents.length; i++) {
                for (var t = 0; t < patterns.length; t++) {
                    if (message.intents[i].slug == patterns[t] && message.intents[i].confidence >= minimum_confidence) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    return middleware;

};
