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

async function getPos(text) {
<<<<<<< HEAD
=======

    await natural.BayesClassifier.load('classifier.json', null, (err, classifier) => {
        if (err) {
            console.log(err);
            return
        }
        check = (classifier.classify(text));
        return check
    })
}

function sentimental(tweets) {
>>>>>>> df1bff5457302f1a7afbb2e19781e9b3cb943af1

    await natural.BayesClassifier.load('classifier.json', null, async (err, classifier) => {
        if (err) {
            console.log(err);
            return
        }
        check = (classifier.classify(text));
        return check
    })
}

<<<<<<< HEAD
// function sentimental(tweets) {

//     var posNeg = []

//     tweets.forEach( function(data) {

//         check = getPos(data.text);
//         console.log(check);
=======
    tweets.forEach( function(data) {

        check = getPos(data.text);
        console.log(check);

        let entry = {
            "author": data.user.name,
            "tweet": data.text,
            "analysis": check
        }

        posNeg.push(entry)
>>>>>>> df1bff5457302f1a7afbb2e19781e9b3cb943af1

//         let entry = {
//             "author": data.user.name,
//             "tweet": data.text,
//             "analysis": check
//         }

<<<<<<< HEAD
//         

//     })

//     console.log(posNeg)
//     return posNeg;
// }
=======
    console.log(posNeg)
    return posNeg;
}
>>>>>>> df1bff5457302f1a7afbb2e19781e9b3cb943af1
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
                console.log(posNeg)
                res.send(posNeg);
            })


            //res.send({ author: user, tweet: text, result: analysis});

        }
        else {
            res.status(500).json({ error: error})
        }
    });
});

module.exports = router;