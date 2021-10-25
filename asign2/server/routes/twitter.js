const express = require('express');
const https = require('https');
const logger = require('morgan');

const router = express.Router();

var Twitter = require('twitter');
router.use(logger('tiny'));
require('dotenv/config');
const natural = require('natural');

const apiKey = process.env.apikey;
const apiSecretKey = process.env.apikeysecret;
const accessToken = process.env.accesstoken;
const accessTokenSecret = process.env.accesstokensecret;

var client = new Twitter({
    consumer_key: apiKey,
    consumer_secret: apiSecretKey,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
});

var check = '';

function sentimental(tweets) {

    var posNeg = []

    tweets.forEach(function(data) {

        natural.BayesClassifier.load('classifier.json', null, (err, classifier) => {
            if (err) {
                console.log(err)
                return
            }
            check = classifier.classify(data.text);
            // Here it will show Positive/Negative
        })

        // Here it will show ''
        console.log(check);

        let entry = {
            "author": data.user.name,
            "tweet": data.text,
            "analysis": ''
        }
        //console.log(entry);
        posNeg.push(entry)

    })

    //console.log(posNeg)
    return posNeg;
}
// Create a request
router.get('/tweets/:tag', (req, res) => {

    // extract the hashtag
    var params = {q: req.params.tag, lang: 'en', result_type: 'recent', exclude: 'retweets'};
    var text = [];
    var user = [];

    client.get('search/tweets', params, function(error, tweets, response) {
        if(!error) {
            //console.log(params.q);

            // Extract the Tweets
            var status = tweets.statuses;
            console.log(status.length);
            // status.map((data) => {
            //     text.push(data.text);
            //     user.push(data.user.name);
            // })
            
            //console.log(text);

            var analysis = sentimental(status);
            //console.log(analysis);


            //res.send({ author: user, tweet: text, result: analysis});

        }
        else {
            res.status(500).json({ error: error})
        }
    });
});

module.exports = router;