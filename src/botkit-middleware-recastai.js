var recastai = require('recastai');
var default_minimum_confidence = 0.5;
var default_language = 'en';

module.exports = function (options) {

    if (!options || !options.request_token) {
        throw new Error('No recast.ai API request token specified !');
    }

    var middleware = {};
    var language = options.language || default_language;
    var minimum_confidence = options.minimum_confidence || default_minimum_confidence;
    var client = new recastai.Client(options.request_token, language);

    middleware.receive = function (bot, message, next) {
        if (message.text) {
            client.textRequest(message.text)
                .then(function (res) {
                    console.log(JSON.stringify(res));
                    // get the intent detected
                    var intent = res.intent()

                    // get all the location entities extracted from your text
                    var locations = res.all('location')

                    next();
                }).catch(function (err) {
                    // Handle error
                    next(err);
                });
        } else if (message.attachments) {
            message.intents = [];
            next();
        } else {
            next();
        }
    };

    middleware.hears = function (tests, message) {
        if (message.entities && message.entities.intent) {
            for (var i = 0; i < message.entities.intent.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                    if (message.entities.intent[i].value == tests[t] &&
                        message.entities.intent[i].confidence >= config.minimum_confidence) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    return middleware;

};
