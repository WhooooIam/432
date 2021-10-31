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

const redisClient = redis.createClient();
redisClient.on('error', (err) => {
    console.log("Error " + err);
});

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

    return redisClient.get(redisKey, (err, result) => {
        // Check to see if data is already in Redis storage
        if (result) {
            
            const resultJSON = JSON.parse(result);
            return res.send(resultJSON);
        }
        // Serve from the API
        else {

            // extract the hashtag
            var params = {q: req.params.tag, lang: 'en', result_type: 'recent', exclude: 'retweets', count: 100, include_entities: true};

            // Get information from Endpoint
            client.get('search/tweets', params, function(error, tweets, response) {
                if(!error) {

                    // Extract the Tweets
                    var status = tweets.statuses; 

                    var posNeg = []

                    natural.BayesClassifier.load('classifier.json', null, async (err, classifier) => {
                        if (err) {
                            console.log(err);
                            return
                        }

                        status.forEach(async function(data) {
                            // remove links
                            var text =(data.text).replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''); //remove https
                            let entry = {
                                            "author": data.user.name,
                                            "tweet": text,
                                            "analysis": (classifier.classify(text)),
                            }
                                
                            posNeg.push(entry)
                        })
                        
                        const responseJSON = posNeg
                        const body = JSON.stringify({ source: 'S3 Bucket', results: responseJSON});
                        const objectParams = {Bucket: bucketName, Key: s3Key, Body: body};
                        const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();

                        uploadPromise.then(function(data) {
                            console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
                        });

                        // Store in the Redis (To expire after 15 minutes)
                        redisClient.setex(redisKey, 900, JSON.stringify({ source: 'Redis Cache', results: responseJSON }));

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