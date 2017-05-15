
var getTimestamps = function (watsonResults) {
    var alternativeTimestamps = [];
    var timestamps = [];
    var resultsLen = 0;
    for (let i = 0; i < watsonResults.length; i++) {

        if (watsonResults[i].result_index != i) {
            console.log("missing result:  " + i);
        }
        resultsLen = watsonResults[i].results.length;
        if (resultsLen <= 1) {
            timestamps = watsonResults[i].results[0].alternatives[0].timestamps;
            alternativeTimestamps = alternativeTimestamps.concat(timestamps);
        }
        else if (resultsLen > 1) {
            for (let r = 0; r < resultsLen; r++) {
                timestamps = watsonResults[i].results[r].alternatives[0].timestamps;
                alternativeTimestamps = alternativeTimestamps.concat(timestamps);
            }
        }

    }
    return alternativeTimestamps;
}

var createWordsMetadata = function (text) {
    var paragraphs = text.split("\n").filter(function (e) {
        if (String(e).trim().length > 0) return String(e).trim();
    });

    var meta = {};
    var paragraphWords = [];
    var arr = [];

    for (let p = 0; p < paragraphs.length; p++) {
        paragraphWords = paragraphs[p].split(" ").filter(e => String(e).trim());
        for (let w = 0; w < paragraphWords.length; w++) {
            meta.word = paragraphWords[w];
            meta.time_stamp = [];
            meta.time_stamp_index = -1;
            meta.paragraph_index = p;
            arr.push(meta);
            meta = {};
        }
    }

    return arr;
}


var createSyncElements = function (metaData) {
    var div = document.createElement('div');
    var p = document.createElement('p');

    var element;
    var stamps = [];
    var begin, end, idName, className = '';

    var pIndex = 0;
    var prevPIndex = 0;

    for (var i = 0; i < metaData.length; i++) {
        stamps = metaData[i].time_stamp;
        begin = stamps[1];
        end = stamps[2];

        // create id and class names 
        if (begin != undefined && end != undefined) {
            idName = i + '_' + begin + '_' + end;
            begin = Math.floor(begin);
            className = 'group_' + begin;
        }

        element = document.createElement('span');
        element.setAttribute("id", idName);
        element.setAttribute("class", className + " wordSpan");
        element.innerText = metaData[i].word + " ";

        // we keep adding to p element until the index changes 
        // in wich we add the p element to div 
        // then create a new p element 
        pIndex = metaData.paragraph_index;
        if (pIndex != prevPIndex) {
            div.appendChild(p);
            p = document.createElement('p');
            prevPIndex = pIndex;
        }

        p.appendChild(element);
    }

    return div;
};


var createSyncMetaData = function (metaData) {
    var syncData = {};
    var spanMeta = {};

    var stamps = [];
    var begin, end, idName, className, word = '';

    var pIndex = 0;

    for (var i = 0; i < metaData.length; i++) {
        stamps = metaData[i].time_stamp;
        begin = stamps[1];
        end = stamps[2];

        idName = 'readical_word_' + i + '_' + begin + '_' + end;
        begin = Math.floor(begin);
        className = 'readical_group_' + begin + " readical_wordSpan";
        word = metaData[i].word + " ";

        spanMeta = {
            id: idName,
            class: className,
            word: word
        };

        pIndex = 'p' + metaData[i].paragraph_index;
        if (pIndex in syncData) {
            syncData[pIndex].push(spanMeta);
        }
        else {
            syncData[pIndex] = [];
            syncData[pIndex].push(spanMeta);
        }
    }

    return syncData;
};


exports.getTimestamps = getTimestamps;
exports.createWordsMetadata = createWordsMetadata;
exports.createSyncElements = createSyncElements;
exports.createSyncMetaData = createSyncMetaData;



