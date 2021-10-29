const express = require('express');
const https = require('https');
const logger = require('morgan');
const redis = require('redis');

const router = express.Router();

var Twitter = require('twitter');
router.use(logger('tiny'));
require('dotenv/config');
const natural = require('natural');

const apiKey = process.env.apikey;
const apiSecretKey = process.env.apikeysecret;
const accessToken = process.env.accesstoken;
const accessTokenSecret = process.env.accesstokensecret;

// This section will change for Cloud Services
// Local Redis is default port 6379
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
    console.log("Error " + err);
});

// Used for header info
//router.use(responseTime());
const AWS = require('aws-sdk');

const bucketName = 'n10229213-twitter-store';
// Create a promise on S3 service object
const bucketPromise = new AWS.S3({apiVersion: '2006-03-01'}).createBucket({Bucket: bucketName}).promise();

bucketPromise.then(function(data) {
    console.log("Successfully created " + bucketName);
})
.catch(function(err) {
    console.error(err, err.stack);
});

var client = new Twitter({
    consumer_key: apiKey,
    consumer_secret: apiSecretKey,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
});

// Create a request
router.get('/tweets/:tag', (req, res) => {

    // Check if it is in storage
    const key = (req.params.tag).trim();
    const s3Key = `twitter-${key}`;
    const redisKey = `twitter:${key}`

    // Check S3
    const params = { Bucket: bucketName, Key: s3Key};

    return new AWS.S3({apiVersion: '2006-03-01'}).getObject(params, (err, result) => {
        if(result) {
            // Serve from S3
            console.log('in the S3');
            const resultJSON = JSON.parse(result.Body);
            console.log(resultJSON);
            return res.send(resultJSON)
        }
        else {
            // extract the hashtag
            var params = {q: req.params.tag, lang: 'en', result_type: 'recent', exclude: 'retweets'};
            // var text = [];
            // var user = [];

            client.get('search/tweets', params, function(error, tweets, response) {
                if(!error) {
                    //console.log(params.q);
                    console.log('in the API');
                    // Extract the Tweets
                    var status = tweets.statuses;

                    var posNeg = []

                    natural.BayesClassifier.load('classifier.json', null, async (err, classifier) => {
                        if (err) {
                            console.log(err);
                            return
                        }
                        status.forEach(async function(data) {
                            let entry = {
                                            "author": data.user.name,
                                            "tweet": data.text,
                                            "analysis": (classifier.classify(data.text))
                            }
                                
                            posNeg.push(entry)
                        })
                        const responseJSON = posNeg
                        console.log(responseJSON);
                        const body = JSON.stringify({ source: 'S3 Bucket', results: responseJSON});
                        const objectParams = {Bucket: bucketName, Key: s3Key, Body: body};
                        const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
                        uploadPromise.then(function(data) {
                            console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
                        });

                        // Store in the Redis
                        // Store in the Cache 
                        redisClient.setex(redisKey, 3600, JSON.stringify({ source: 'Redis Cache', results: responseJSON }));

                        //console.log(posNeg)
                        //res.send({source: 'twitter', ...posNeg});
                        return res.send({ source: 'Twiiter API', results: responseJSON});
                    })

                }
                else {
                    res.status(500).json({ error: error})
                }
    });
        }
    });


});

module.exports = router;