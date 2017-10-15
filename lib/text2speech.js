var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var text_to_speech = new TextToSpeechV1 ({
  username: process.env.TTS_USER,
  password: process.env.TTS_PASS
});

// text_to_speech.voice({voice: 'en-US_AllisonVoice'}, function(error, voice) {
//   if (error)
//     console.log('Error:', error);
//   else
//     console.log(JSON.stringify(voice, null, 2));
// });

module.exports = text_to_speech
