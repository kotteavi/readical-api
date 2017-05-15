
const cors = require('cors');
const reqPromise = require('request-promise-native');
const express = require('express');
const fs = require("fs");
const pug = require('pug');


var app = express();
app.use(cors());  // Enable CORS headers on responses for all routes.
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('widgetSample'));

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
// https://readical.herokuapp.com/
if (IS_PROD) {
  process.env.SERVER_USE_HTTPS = process.env.SERVER_USE_HTTPS || 'true';
  process.env.CLIENT_USE_HTTPS = process.env.CLIENT_USE_HTTPS || 'true';
  process.env.CLIENT_HOST = process.env.CLIENT_HOST || 'readical.herokuapp.com';
  process.env.CLIENT_PORT = process.env.CLIENT_PORT || '';
}

const SERVER_USE_HTTPS = (process.env.SERVER_USE_HTTPS || '').toString === 'true';
const SERVER_PROTOCOL = SERVER_USE_HTTPS ? 'https:' : 'http:';
const SERVER_HOST = process.env.SERVER_HOST || process.env.HOST || '0.0.0.0';
const SERVER_PORT = process.env.SERVER_PORT || process.env.PORT || 8081;

const CLIENT_USE_HTTPS = (process.env.CLIENT_USE_HTTPS || '').toString === 'true';
const CLIENT_PROTOCOL = CLIENT_USE_HTTPS ? 'https:' : 'http:';
const CLIENT_HOST = process.env.CLIENT_HOST || process.env.HOST || '0.0.0.0';
const CLIENT_PORT = process.env.CLIENT_PORT || process.env.PORT || 8081;

app.get('/', (req, res) => {
  res.send({
    status: 'ok'
  });
});

const structure = require('./js/extrapolateVoiceText/structure.js');
const sample = require('./widgetSample/ISSTHWatsonResults.js');
const extrapolation = require('./js/extrapolateVoiceText/extrapolation.js');

// The third party script calls this end point
app.get('/widgetData', (req, res) => {
  var page = req.query.page;

  var html = '';
  if (page == 'ISSTH_1364') {
    var data = fs.readFileSync('./widgetSample/ISSTH1364.txt');
    data = structure.createWordsMetadata(data.toString());

    var timestamps = structure.getTimestamps(sample.watsonResults);

    extrapolation.fixMetaData(data, timestamps);
    var syncData = structure.createSyncMetaData(data);

    var audioAttributes = {
      page: page,
      src: 'https://readical.herokuapp.com/ISSTH1364.ogg'
    }

    html = pug.renderFile('./views/widgetTemplate.pug', {
      syncData: syncData,
      audio: audioAttributes
    });
  }

  res.send({
    html: html
  });
});

// Renders audible test page, it has text and player that sync
app.get('/audibleTest', (req, res) => {

  var data = fs.readFileSync('./widgetSample/ISSTH1364.txt');
  data = structure.createWordsMetadata(data.toString());

  var timestamps = structure.getTimestamps(sample.watsonResults);

  extrapolation.fixMetaData(data, timestamps);
  var syncData = structure.createSyncMetaData(data);

  var audioAttributes = {
    src: '/ISSTH1364_64kpbs.mp3'
  }

  var attributes = {
    syncData: syncData,
    audio: audioAttributes,
    title: 'I Shall Seal the Heavens (我欲封天)'
  };

  res.render('../views/audibleTemplate.pug', attributes);

});

const garfield = require('./widgetSample/Garfield/WatsonResults.js');
app.get('/peterAudio', (req, res) => {

  var data = fs.readFileSync('./widgetSample/Garfield/text.txt');
  data = structure.createWordsMetadata(data.toString());

  var timestamps = structure.getTimestamps(garfield.GarfieldWatsonResults);

  extrapolation.fixMetaData(data, timestamps);
  var syncData = structure.createSyncMetaData(data);

  var audioAttributes = {
    src: '/Garfield/audio_64kpbs.mp3'
  }

  var attributes = {
    syncData: syncData,
    audio: audioAttributes,
    title: 'Garfield - Sheen Instincts'
  };

  res.render('../views/audibleTemplate.pug', attributes);

});

// const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

// const speech_to_text = new SpeechToTextV1({
//   "url": "https://stream.watsonplatform.net/speech-to-text/api",
//   "username": "ae85b4a1-9a58-4926-bcd0-09254c2324a6",
//   "password": "olda4rYuLywZ"
// });

// const params = {
//   content_type: 'audio/wav'
// };

// // create the stream
// const recognizeStream = speech_to_text.createRecognizeStream(params);

// // pipe in some audio
// fs.createReadStream(__dirname + '/resources/speech.wav').pipe(recognizeStream);

// // and pipe out the transcription
// recognizeStream.pipe(fs.createWriteStream('transcription.txt'));

// // listen for 'data' events for just the final text
// // listen for 'results' events to get the raw JSON with interim results, timings, etc.

// recognizeStream.setEncoding('utf8'); // to get strings instead of Buffers from `data` events

// ['data', 'results', 'speaker_labels', 'error', 'close'].forEach(function (eventName) {
//   recognizeStream.on(eventName, console.log.bind(console, eventName + ' event: '));
// });


app.listen(SERVER_PORT, '0.0.0.0');
