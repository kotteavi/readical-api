
const cors = require('cors');
const reqPromise = require('request-promise-native');
const express = require('express');
const fs = require("fs");
const pug = require('pug');


var app = express();
app.use(cors());  // Enable CORS headers on responses for all routes.
app.set('view engine', 'pug');
app.use(express.static('public'));
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
      src: 'http://widget.dev:8081/ISSTH1364.ogg'
    }

    html = pug.renderFile('./views/widget.pug', {
      syncData: syncData,
      audio: audioAttributes
    });
  }

  res.send({
    html: html
  });
  // res.render('widget', { syncData: syncData });

});


app.get('/widgetAudio.js', (req, res) => {
  res.send({
    status: 'ok'
  });
});

app.listen(SERVER_PORT, '0.0.0.0');

// app.listen(SERVER_PORT, '0.0.0.0', () => {
//   console.log('Listening on port %s//%s:%s',
//     SERVER_PROTOCOL, SERVER_HOST, SERVER_PORT);
// });