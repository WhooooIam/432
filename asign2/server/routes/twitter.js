const express = require('express');
const https = require('https');
const logger = require('morgan');
const redis = require('redis');

const router = express.Router();

var Twitter = require('twitter');
router.use(logger('tiny'));
require('dotenv/config');
const natural = require('natural');

const { ElastiCacheClient, AddTagsToResourceCommand } = require("@aws-sdk/client-elasticache");

const apiKey = process.env.apikey;
const apiSecretKey = process.env.apikeysecret;
const accessToken = process.env.accesstoken;
const accessTokenSecret = process.env.accesstokensecret;

const AWS = require('aws-sdk');
//AWS.config.update({region:'ap-southeast-2'});

const redisClient = redis.createClient({
    host: 'n10229213-redis.km2jzi.ng.0001.apse2.cache.amazonaws.com',
    port: 3679
});
redisClient.on('error', (err) => {
    console.log('in redis error');
    console.log("Error " + err);
});

var elasticache = new ElastiCacheClient({
    region: 'ap-southeast-2'
});

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
    var key = (req.params.tag).trim();

    key = key.replace('#', '');

    const s3Key = `twitter-${key}`;
    const redisKey = `${key}`

    
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

                        // var params_redis = {
                        //     ResourceName: 'arn:aws:elasticache:ap-southeast-2:901444280953:cluster:n10229213-redis', 
                        //     Tags: [ /* required */
                        //     {
                        //         Key: redisKey,
                        //         //Value: JSON.stringify({ source: 'Redis Cache', results: responseJSON })
                        //     }],
                        //     Data: JSON.stringify({ source: 'Redis Cache', results: responseJSON })
                        // };
                        // elasticache.addTagsToResource(params_redis, function(err, data) {
                        //     if (err) console.log(err, err.stack); // an error occurred
                        //     else     console.log('Elasticache done');           // successful response
                        // });
                        // const command = new AddTagsToResourceCommand(params_redis);
                        // elasticache.send(command)
                        // .then((data) => {
                        //     //Process the Data
                        //     console.log(data);
                        // })
                        // .catch((error) => {
                        //     console.log(error)
                        // });

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