const natural = require('natural');


natural.BayesClassifier.load('classifier.json', null, function (err, classifier) {
    // returns negative
    console.log(classifier.classify('i hate this'))
})
