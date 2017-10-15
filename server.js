var express = require('express');
var App = express();
var Path = require('path');
var Server = require('http').createServer(App);
const Settings = require('./settings');
var fs = require('fs');

// Watson API
const SpeechToText = require('./lib/speech2text');
const TextToSpeech = require('./lib/text2speech');
const Conversation = require('./lib/conversation');

function generateAudio2(txt){
  var params = {
    text: txt,
    voice: 'en-US_AllisonVoice',
    accept: 'audio/wav'
  };
  // Pipe the synthesized text to a file.
  var res = TextToSpeech.synthesize(params).on('error', function(error) {
    console.log('Error:', error);
  }).pipe(fs.createWriteStream('public/response.wav'));
}

function generateAudio(txt){
  var params = {
    text: txt,
    voice: 'en-US_AllisonVoice',
    accept: 'audio/wav'
  };
  // Pipe the synthesized text to a file.
  return TextToSpeech.synthesize(params).on('error', function(error) {
    console.log('Error:', error);
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
    // When connect send for respond
    Conversation.message({
      workspace_id: "b974c6b2-7910-4810-8395-327216a3541e",
      input: {'text': ""},
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

    socket.on('message', function (data) {
      // got message from watson
      console.log("User message: " + data);

      Conversation.message({
        workspace_id: "b974c6b2-7910-4810-8395-327216a3541e",
        input: {'text': data},
        context: context
      },  function(err, response) {
        if (err)
          console.log('error:', err);
        else
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
      });
    });

    socket.on('audio', function (data) {
      // got message from watson
      // console.log(data);

      fs.writeFileSync('message.webm', data)

      // send voice to STT api
      var params = {
        audio: fs.createReadStream('message.webm'),
        model: 'en-US_BroadbandModel',
        content_type: 'audio/webm',
        'interim_results': false,
        'max_alternatives': 3,
        'word_confidence': false,
      };

      SpeechToText.recognize(params, function (error, transcript) {
        if (error)
          console.log('Error:', error);
        else {
          // console.log(JSON.stringify(transcript, null, 2));

          socket.emit('transcode', transcript);
        }
      })


    });

});
