var isWorking = false;
var noteContent = '';
var callbackFunc;
var recognition;
var is2StopAudio = false;

/**
 * 音声入力の初期化
 **/
function initialAudioInput(callback){
	try {
	  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	  recognition = new SpeechRecognition();
	  recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = recognitionOnResult;
	  recognition.onstart = recognitionOnStart;
	  recognition.onspeechend = recognitionSpeechEnd;
	  recognition.onerror = onError;
	  recognition.lang = 'ja-JP';
	  is2StopAudio = false;
	  
	  callbackFunc = callback;
	}
	catch(e) {
	  console.error(e);
	}
}

/**
 * 音声入力の開始
 **/
function startAudioInput() {
	if(is2StopAudio)
		return;
	
	setTimeout(function(){
		if(!isWorking){
		    recognition.start();
	    }
	}, 2000);
  
}

/**
 * 音声入力の終了
 **/
function stopAudioInput() {
	is2StopAudio = true;
    recognition.abort();
}

/*-----------------------------
      语音识别 
------------------------------*/
function recognitionOnResult(event) {

  // event 是一个SpeechRecognitionEvent 对象
  // 保存了所有历史捕获对象 
  // 我们只取当前的内容
  /*var current = event.resultIndex;

  // 获取此前所说话的记录
  var transcript = event.results[current][0].transcript;

  // 将当前记录添加到笔记内容中
  // 解决安卓设备的bug
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent = transcript;
   　if(callbackFunc){
	   console.log('transcript is:' + transcript);
	   callbackFunc(noteContent);
	}
  }*/
    var results = event.results;
	for (var i = event.resultIndex; i < results.length; i++) {
		noteContent = results[i][0].transcript;
	   　if(callbackFunc){
		   console.log('transcript is:' + noteContent);
		   callbackFunc(results[i].isFinal, noteContent);
		}
	}
}

function recognitionOnStart() { 
	console.log("recognitionOnStart");
    isWorking = true;
}

function recognitionSpeechEnd() {
	isWorking = false;
	recognition.stop();
 　　 console.log('音声認識サービスが停止されました');
 　　　startAudioInput();
}

function onError(event) {
	console.log("recognition onError");
	isWorking = false;
	startAudioInput();
}
