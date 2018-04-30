const Router = require('express').Router;
const fs = require('fs');
const path = require('path');
const https = require('https');
const {welcome, menu} = require('./handler');

const router = new Router();

// POST /ivr/welcome
router.post('/welcome', (req, res) => {
  res.send(welcome());
});

// POST /ivr/menu
router.post('/menu', (req, res) => {
  const digit = req.body.Digits;
  return res.send(menu(digit));
});

// POST /ivr/questions - save recorded question to a local folder
router.post('/questions', (req, res) => {
  // get url of just recorded question
  const url = req.body.RecordingUrl;
  // open writeable stream to given file - will later add data
  const fileToSaveTo = fs.createWriteStream(path.join(__dirname, `../../public/audio/questions/${Date.now()}.wav`));
  // get the url and push all the data into created writeable stream
  https.get(url, function(response) {
  response.pipe(fileToSaveTo);
  });
});

// POST /ivr/answers - save recorded answer to a local folder
router.post('/answers', (req, res) => {
  const url = req.body.RecordingUrl;
  const fileToSaveTo = fs.createWriteStream(path.join(__dirname, `../../public/audio/answers/${Date.now()}.wav`));
  // get the url and push all the data into created writeable stream
  https.get(url, function(response) {
    response.pipe(fileToSaveTo);
  });
});

module.exports = router;
