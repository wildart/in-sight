'use strict';

const output = document.querySelector('.output');
const status = document.querySelector('.status');
const socket = io();

if (!window.AudioContext) {
  if (!window.webkitAudioContext) {
      alert("Your browser does not support any AudioContext and cannot play back this audio.");
  }
  window.AudioContext = window.webkitAudioContext;
}

var audiocontext = new AudioContext(); // Audio context
var audiobuf;        // Audio buffer

function _base64ToArrayBuffer(base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array( len );
  for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function playByteArray(byteArray) {
  // var arrayBuffer = new ArrayBuffer(byteArray.length);
  // var bufferView = new Uint8Array(arrayBuffer);
  // for (var i = 0; i < byteArray.length; i++) {
  //   bufferView[i] = byteArray[i];
  // }

  // audiocontext.decodeAudioData(arrayBuffer, function(buffer) {
  //     audiobuf = buffer;
  //     play();
  // });

  var buf = _base64ToArrayBuffer(byteArray);
  audiocontext.decodeAudioData(buf, function(buffer) {
    audiobuf = buffer;
    play();
  });
}

// Play the loaded file
function play() {
  // Create a source node from the buffer
  var source = audiocontext.createBufferSource();
  source.buffer = audiobuf;
  // Connect to the final output node (the speakers)
  source.connect(audiocontext.destination);
  // Play immediately
  source.start(0);
}

function createDisplayNode(txt, dir) {
  var para = document.createElement("P");    // Create a <p> node
  var side = document.createElement("B");
  if (dir == "person") {
    side.appendChild(document.createTextNode("You: "));
  } else {
    side.appendChild(document.createTextNode("Insight: "));
  }
  para.appendChild(side);
  var t = document.createTextNode(txt);      // Create a text node
  para.appendChild(t);
  return para;
}

socket.on('reply', function (msg) {
    console.log(msg);
    output.appendChild(createDisplayNode(msg, "bot"))
});

socket.on('reply audio', function (msg) {
  playByteArray(msg);
});

socket.on('transcode', function (msg) {
  var alt = msg.results[0].alternatives;
  var txt = "";
  if (alt.length == 1){
    txt = alt.transcript;
  } else {
    txt = alt[1].transcript;
  }
  console.log(txt);
  output.appendChild(createDisplayNode(txt, "person"))
  socket.emit('message', txt);
});


// socket.on('bot reply', function(replyText) {
//   synthVoice(replyText);

//   if(replyText == '') replyText = '(No answer...)';
//   outputBot.textContent = replyText;
// });

document.querySelector("[id='send']").addEventListener('click', () => {
  var txt = document.getElementsByName("chatbox")[0].value;
  output.appendChild(createDisplayNode(txt, "person"))
  console.log("sent: "+ txt);
  socket.emit('message', txt);
});

// document.querySelector("[id='speech']").addEventListener('click', () => {
//   var recorder = new RecordAudio(userMedia);
//   recorder.start();
//   recorder.stop();
//   var recordedData = recorder.getData()
//   console.log("sent: audio");
//   socket.emit('audio', recordedData);
// });


var audioChunks = [];
var rec;

navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia);
if (navigator.getUserMedia) {
  navigator.getUserMedia({audio:true}, function(stream)  {
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => {
      audioChunks.push(e.data);
      if (rec.state == "inactive"){
        let blob = new Blob(audioChunks,{type:'audio/webm'});
        socket.emit('audio', blob);
      }
    }
  }, function (){console.log("Error getting audio stream from getUserMedia")});
} else {
  alert('getUserMedia() is not supported in your browser');
}

// navigator.mediaDevices.getUserMedia({audio:true})
// .then(stream => {
//   rec = new MediaRecorder(stream);
//   rec.ondataavailable = e => {
//     audioChunks.push(e.data);
//     if (rec.state == "inactive"){
//       let blob = new Blob(audioChunks,{type:'audio/webm'});
//       socket.emit('audio', blob);
//    }
//   }
// })
// .catch(e=>console.log(e));

var recording = false;

speech.onclick = e => {
  if (!recording) {
    audioChunks = [];
    recording = true;
    status.textContent = "recording..."
    rec.start();
  } else {
    recording = false;
    rec.stop();
    status.textContent = ""
  }
}
