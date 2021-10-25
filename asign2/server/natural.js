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


// Negative
classifier.addDocument('I hate this', 'negative')
classifier.addDocument('I am so angry', 'negative')
classifier.addDocument('This is the worst day ever', 'negative')
classifier.addDocument('The worst service ever', 'negative')
classifier.addDocument('i hate the rainy weather', 'negative')
classifier.addDocument('there is rubbish everywhere', 'negative')
classifier.addDocument('that dog is so ugly', 'negative')

//Neutral
classifier.addDocument('Today is monday', 'neutral')
classifier.addDocument('check out the lastest news', 'neutral')

classifier.train()

classifier.save('classifier.json', function (err, classifier) {
    if (err) {
        console.log(err)
    }
    // the classifier is saved to the classifier.json file!
})


