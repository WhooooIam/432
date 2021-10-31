/*
    Natural.js is used to train the classifications for
    the setimental analysis.
    To update, Run node natural.js
*/
const natural = require('natural')
const classifier = new natural.BayesClassifier()

// Positive
classifier.addDocument('My dog is so cute', 'positive')
classifier.addDocument('I love this game', 'positive')
classifier.addDocument('I love you', 'positive')
classifier.addDocument('This breakfast is delicious', 'positive')
classifier.addDocument('the weather is so nice', 'positive')
classifier.addDocument('Have a happy holiday', 'positive')
classifier.addDocument('i had such a wonderful time today', 'positive')
classifier.addDocument('Tune in to enjoy some nice music', 'positive')
classifier.addDocument('Happy Birthday!', 'positive')
classifier.addDocument('what a pretty sunset', 'positive')
classifier.addDocument('Happy Birthday!', 'positive')


// Negative
classifier.addDocument('I hate this', 'negative')
classifier.addDocument('I am so angry', 'negative')
classifier.addDocument('This is the worst day ever', 'negative')
classifier.addDocument('The worst service ever', 'negative')
classifier.addDocument('i hate the rainy weather', 'negative')
classifier.addDocument('there is rubbish everywhere', 'negative')
classifier.addDocument('that dog is so ugly', 'negative')
classifier.addDocument('I am scared', 'negative')
classifier.addDocument('i am horrified', 'negative')
classifier.addDocument('this food is disgusting', 'negative')
classifier.addDocument('my house got robbed', 'negative')
classifier.addDocument('There is so much crime', 'negative')
classifier.addDocument('the bushfire burnt down my house', 'negative')
classifier.addDocument('go to hell', 'negative')
//Neutral
classifier.addDocument('Today is monday', 'neutral')
classifier.addDocument('check out the lastest news', 'neutral')
classifier.addDocument('Going to the shops', 'neutral')
classifier.addDocument('today was casual', 'neutral')
classifier.addDocument('I am scared', 'neutral')
classifier.addDocument('its harvest season', 'neutral')


classifier.train()

classifier.save('classifier.json', function (err, classifier) {
    if (err) {
        console.log(err)
    }
    // the classifier is saved to the classifier.json file!
})


