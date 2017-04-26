const levenshteinDistance = require('./levenshteinDistance.js');
var similarity = levenshteinDistance.similarity;


var findMatched = function (wordsMetadata, timestamps) {
    var stampMatch = 0;
    for (let o = 0; o < wordsMetadata.length; o++) {

        var original = wordsMetadata[o];
        var orgWord = removePunctuation(original.word);
        for (let t = stampMatch; t < timestamps.length; t++) {
            if (t == stampMatch + 8) {
                break;
            }

            var timestamp = timestamps[t];
            var transWord = removePunctuation(timestamp[0]);

            if (orgWord == transWord || similarity(orgWord, transWord) > .75) {
                original.time_stamp = timestamp;
                original.time_stamp_index = t;
                stampMatch = t + 1;
                break;
            }
        }
    }
}

function removePunctuation(str) {
    var punctuationless = str.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    return (punctuationless.replace(/\s{2,}/g, " ")).toLowerCase().trim();
}

var fixUnmatched = function (wordsMetadata, timestamps) {
    var hasStampIndex = null;
    var nextHasStampIndex = null;

    var prevMatched = null;
    var nextMatched = null;

    for (var i = 0; i < wordsMetadata.length; i++) {
        hasStampIndex = wordsMetadata[i].time_stamp_index != -1;

        if (hasStampIndex && prevMatched == null) {
            prevMatched = i;
        } else if (hasStampIndex && ((prevMatched + 1) == i)) {
            prevMatched = i;
        }
        else if (hasStampIndex && prevMatched != null) {
            nextMatched = i;
        }

        if (prevMatched != null && nextMatched != null) {
            addMissingTimestamps(prevMatched, nextMatched, wordsMetadata, timestamps);

            prevMatched = null;
            nextMatched = null;

            if (i != wordsMetadata.length - 1) {
                nextHasNoStampIndex = wordsMetadata[i + 1].time_stamp_index == -1;
                if (nextHasNoStampIndex && prevMatched == null) {
                    prevMatched = i;
                }
            }

        }

        if ((i == wordsMetadata.length - 1) && !hasStampIndex) {
            var start = wordsMetadata[prevMatched].time_stamp[2];
            var end = timestamps[timestamps.length - 1][2];
            wordsMetadata[wordsMetadata.length - 1].time_stamp = ['', start, end];
        }


    }
}

function addMissingTimestamps(prevIndex, nextIndex, wordsMetadata, timestamps) {

    var timeDiff = wordsMetadata[nextIndex].time_stamp[1] - wordsMetadata[prevIndex].time_stamp[2];


    var betweenIndexes = [];
    for (let i = prevIndex + 1; i < nextIndex; i++) {
        betweenIndexes.push(i);
    }
    var diff = betweenIndexes.length;

    var totalLength = 0;
    var wordsLengths = [];
    for (let i = 0; i < diff; i++) {
        var word = wordsMetadata[betweenIndexes[i]].word
        wordsLengths.push(word.length);
        totalLength = totalLength + word.length;
    }

    var timeDistances = [];
    var seconds = 0.0;
    for (let i = 0; i < wordsLengths.length; i++) {
        seconds = (wordsLengths[i] / totalLength) * timeDiff;
        timeDistances.push(seconds);
    }

    var prevEndTime = wordsMetadata[prevIndex].time_stamp[2];
    var index = 0;
    for (let i = 0; i < diff; i++) {
        wordsMetadata[betweenIndexes[i]].time_stamp = ['', prevEndTime, prevEndTime + timeDistances[index]];
        prevEndTime = prevEndTime + timeDistances[index];
        index++;
    }
}

var fixMetaData = function (wordsMetadata, timestamps) {
    findMatched(wordsMetadata, timestamps);
    fixUnmatched(wordsMetadata, timestamps);
};

exports.fixMetaData = fixMetaData;