var express = require('express');
var App = express();
var Path = require('path');
var Server = require('http').createServer(App);
const Settings = require('./config/settings');
var fs = require('fs');
var stream = require('stream');

// Watson API
const SpeechToText = require('./lib/speech2text');
const TextToSpeech = require('./lib/text2speech');
const Conversation = require('./lib/conversation');

function generateAudio(txt){
  var params = {
    text: txt,
    voice: 'en-US_LisaVoice',
    accept: 'audio/wav'
  };
  // Pipe the synthesized text to a file.
  return TextToSpeech.synthesize(params).on('error', function(error) {
    console.log('Error:', error);
  });
}

function dialog(msg, socket){
  Conversation.message({
    workspace_id: "b974c6b2-7910-4810-8395-327216a3541e",
    input: {'text': msg},
    context: context
  },  function(err, response) {
    if (err)
      console.log('error:', err);
    else {
      var txt = response.output.text[0];
      console.log(txt);
      var rpipe = generateAudio(txt);
      var buffers = [];
      rpipe.on('data', function(buffer) {
        buffers.push(buffer);
      });
      rpipe.on('end', function() {
        var buffer = Buffer.concat(buffers);
        let base64String = buffer.toString('base64');
        socket.emit('reply audio', base64String);
      });
      socket.emit('reply', txt);
    }
  });
}

var IO = require('socket.io')(Server);

Server.listen(Settings.port, function () {
  console.log('Server listening at port %d', Settings.port);
});

// Routing
App.use(express.static(Path.join(__dirname, 'public')));

// send message to conversation api
var context = {};

IO.on('connection', function (socket) {
    // When connected send a greeting
    dialog("", socket);

    socket.on('message', function (data) {
      // got user text message
      console.log("User message: " + data);
      dialog(data, socket);
    });

    // send voice to STT api
    socket.on('audio', function (data) {
      // Create the stream.
      var bufferStream = new stream.PassThrough();
      bufferStream.end(data);
      // Create recognition script
      var params = {
        model: 'en-US_BroadbandModel',
        content_type: 'audio/webm',
        'interim_results': false,
        'max_alternatives': 3,
        'word_confidence': false
      };
      var recognizeStream = SpeechToText.createRecognizeStream(params);
      // Pipe it to recognition
      bufferStream.pipe(recognizeStream);
      recognizeStream.setEncoding('utf8');
      recognizeStream.on('results', function(transcript) {
          // console.log(JSON.stringify(transcript, null, 2));
          socket.emit('transcode', transcript);
      });
      recognizeStream.on('error', function(error) { console.log('Recognize Error:', error); });
    });

});
