const express = require('express');
const https = require('https');
const logger = require('morgan');

const router = express.Router();

var Twitter = require('twitter');
router.use(logger('tiny'));
require('dotenv/config');

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

// Create a request
router.get('/tweets/:tag', (req, res) => {

    // extract the hashtag
    var params = {q: req.params.tag, lang: 'en', result_type: 'recent', exclude: 'retweets'};

    client.get('search/tweets', params, function(error, tweets, response) {
        if(!error) {
            console.log(params.q);
            res.send(tweets);
        }
        else {
            res.status(500).json({ error: error})
        }
    });
});

module.exports = router;