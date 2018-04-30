const VoiceResponse = require('twilio').twiml.VoiceResponse;
const fs = require('fs');
const path = require('path');

// initial welcome message
exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();
  const welcomeMessage = '/audio/initial_prompt.wav';

  // gather user input from menu
  const gather = voiceResponse.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
  });

  // play a welcome message
  gather.play({loop: 3}, welcomeMessage);

  return voiceResponse.toString();
};

// choose a digit and then go to a specific question
exports.menu = function menu(digit) {
  // if participant wants to ask, listen, answer or stop recording
  const dialedDigit = {
    '1': askQuestion,
    '2': listenToQuestion,
    '3': answerQuestion,
    '*': repeatPrompt,
    '0': endInteraction,
  };

  return (dialedDigit[digit])
    ? dialedDigit[digit]()
    : redirectWelcome();
};

/**
 * Returns Twiml
 * @return {String}
 */
function askQuestion() {
  const twiml = new VoiceResponse();

  // pause for a second
  twiml.pause();

  // play prompt before recording
  twiml.play('/audio/before_ask.wav');

  // record a message
  twiml.record({
    maxLength: 60,
    recordingStatusCallback: '/ivr/questions/',
  });

  return twiml.toString();
}

/**
 * Returns Twiml
 * @return {String}
 */
function listenToQuestion() {
  const twiml = new VoiceResponse();

  // get user input - will be needed after listening to a question
  const gather = twiml.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
  });

  // play a random question
  const questions = fs.readdirSync(path.join(__dirname, '../../public/audio/questions/'));
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  gather.play(`/audio/questions/${randomQuestion}`);

  // play another prompt
  gather.play({loop: 2}, '/audio/after_listen.wav');

  return twiml.toString();
}

/**
 * Returns Twiml
 * @return {String}
 */
function answerQuestion() {
  const twiml = new VoiceResponse();

  // play prompt before recording
  twiml.play('/audio/before_answer.wav');
  // record / on stop will go to prompt again
  twiml.record({
    maxLength: 60,
    recordingStatusCallback: '/ivr/answers/',
  });

  return twiml.toString();
}

/**
 * Returns an xml with the redirect
 * @return {String}
 */
function redirectWelcome() {
  const twiml = new VoiceResponse();

  twiml.pause();
  twiml.redirect('/ivr/welcome');

  return twiml.toString();
}

/**
 * Returns Twiml
 * @return {String}
 */
function repeatPrompt() {
  const twiml = new VoiceResponse();

  // gather input after recording
  const gather = twiml.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
  });

  gather.pause();
  gather.play({loop: 2}, '/audio/prompt_again.wav');

  return twiml.toString();
}

/**
 * Returns Twiml
 * @return {String}
 */
function endInteraction() {
  const twiml = new VoiceResponse();

  // gather input after recording
  const gather = twiml.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
  });

  gather.pause();
  gather.play({loop: 2}, '/audio/end.wav');

  return twiml.toString();
}
