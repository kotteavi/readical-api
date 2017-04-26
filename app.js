
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

app.listen(8081, 'widget.dev');