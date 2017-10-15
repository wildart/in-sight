var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var speech_to_text = new SpeechToTextV1 ({
  username: process.env.STT_USER,
  password: process.env.STT_PASS
});

// speech_to_text.getModel({ model_id: 'en-US_BroadbandModel' }, function(error, model) {
//   if (error)
//     console.log('Error:', error);
//   else
//     console.log(JSON.stringify(model, null, 2));
// });

module.exports = speech_to_text
