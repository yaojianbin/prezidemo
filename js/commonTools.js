class CommonTools{

	constructor(textAreaMemo, video, swiper, audioResult,isAn){
		//textareaの要素
		this.textAreaObject = textAreaMemo;
		//videoの要素
		this.video = video;
		//swiperの要素
		this.mySwiper = swiper;
		this.audioResult = audioResult;
		this.lastestIndexSwitchInfos4Play = 0; //再生中、最新の切り替え情報のindex
		this.localMemos = [];
		this.swipeActiveIndex = 0;
		this.mediaRecorder = null;
        this.mediaStream = null;
        this.recorderFile = null;
		this.videoTotalTime;
		this.isPlay = false; //true: play the recorded video; false: donot play the recorded video
		this.isRecord = false; //true: record the video; false: donot record the video
	    this.textUpdateTimeoutID;
		this.videoFileName;
		this.audioStartTime = null;
		this.audioTextDurationTime = 5;
		// this.localDestPath = "\\Users\\admin\\Downloads\\";
	    this.localDestPath = "\\Users\\dangy\\Downloads\\";
		this.isAn=isAn;

	    /**
	     * メモを保存する
	     **/
        this.textAreaObject.addEventListener('change', (e) => {
			var isFound = false;
			this.localMemos.forEach((item, idx)=>{
				if(!isFound && item.index == this.mySwiper.activeIndex){
					item.content = this.textAreaObject.value;
					isFound = true;
				}
			});
			if(!isFound) {
				var m = {};
				m.content = this.textAreaObject.value;
				m.index = this.mySwiper.activeIndex;
				this.localMemos.push(m);
			}
		});
		
	    /**
	     * メモを変更するときのレスポンス関数
	     **/
		this.textAreaObject.addEventListener('input', (e) => {
			//メモのエリアのサイズの更新
			this.textAreaHeightSet();
		});
	
	    /**
	     * イメージの切り替えのレスポンス関数
	     **/
		this.mySwiper.on('transitionEnd', (e)=> {
		
			if(this.isAn){
				return;
			}
			this.swiperTransitionEnd(e);
		});
		this.mySwiper.on('onSlideChangeStart', (e)=> {
			if(this.isAn){
				this.swiperTransitionEnd(e);
			}
		
		});
		
	    /**
	     * ビデオ再生についてのレスポンス関数
	     **/
		this.video.addEventListener("timeupdate", (e)=>{
	        this.videoTimeupdate(e);
	    });
        this.video.addEventListener("play", (e)=>{
            if(!this.isRecord){
			    this.isPlay = true;
			}
        });
        this.video.addEventListener("ended", (e)=>{
			this.videoEnded(e);
		});
		this.video.addEventListener("abort", (e)=>{
			this.videoEnded(e);
		});
		this.video.addEventListener("error", (e)=>{
			this.videoEnded(e);
		});
	}
	videoEnded(e) {
		this.isPlay = false;
        this.lastestIndexSwitchInfos4Play = 0;
	}
	
	//メモのエリアのサイズの更新
　　　　textAreaHeightSet(){
	    var argObj = this.textAreaObject;
        // 一旦テキストエリアを小さくしてスクロールバー（縦の長さを取得）
        argObj.style.height = "10px";
        var wSclollHeight = parseInt(argObj.scrollHeight);
        // 1行の長さを取得する
        var wLineH = parseInt(argObj.style.lineHeight.replace(/px/, ''));
        // 最低2行の表示エリアにする
        if(wSclollHeight < (wLineH * 2)){wSclollHeight=(wLineH * 2);}
        // テキストエリアの高さを設定する
        argObj.style.height = wSclollHeight + "px";
    }
	/**
	 * イメージの切り替えのレスポンス関数
	 **/
	swiperTransitionEnd(e) {
		//メモの切り替え
		this.changeMemo(mySwiper.activeIndex);
		//再生の時、ビデオ作成済の情報で切り替えるので、処理しない
		if(this.isPlay || !this.isRecord){
			//this.audioResult.innerHTML = '';
			this.swipeActiveIndex = this.mySwiper.activeIndex;
			return;
		}

		if(this.swipeActiveIndex === this.mySwiper.activeIndex){
			return;
		}
		this.swipeActiveIndex = this.mySwiper.activeIndex;
		
		//リセット
		var info = {};
		//this.audioResult.innerHTML = '';
		//切り替えの情報の保存
		info.time = Math.floor((Date.now() - this.timeStartVideo) / 1000);
		info.index = this.mySwiper.activeIndex;
		console.log('transitionEnd. the active index is: ' + this.mySwiper.activeIndex);
		console.log('transitionEnd. video.currentTime is: ' + this.video.currentTime);
		console.log('transitionEnd. info.time is: ' + info.time);
		this.pptImgSwitchInfo.push(info);
	};
	/**
	 * 音声入力--転換文字のコールバック関数
	 **/
	audioResultCallback(isFinal, audioText){
		if(audioText){
			this.audioResult.innerHTML = audioText;
    		this.setTimeoutForClearText();
		
		    if(isFinal){
				var now = Date.now();
				var timeOff = Math.floor((now - this.audioStartTime) / 1000);
				console.log("Date.now():" + now + "  timeOff:" + timeOff);
                var isFind = false;
			    var info = {};
                var curTime = Math.floor((now - this.timeStartVideo) / 1000) - timeOff - 2;
                /*for(var i=0; i < this.pptImgSwitchInfo.length; i++)
				{
				    info = this.pptImgSwitchInfo[i];
					if(info.time == curTime)
					{
						info.audioContent = audioText;
						info.audioContentDuration = timeOff > 5 ? timeOff: 5;
						isFind = true;
						break;
					}
				}*/
				if(!isFind){
					//音声での入力の内容を保存
					info.time = curTime;
					info.audioContent = audioText;
					info.audioContentDuration = timeOff > 5 ? timeOff : 5;
					info.index = this.mySwiper.activeIndex;
					this.pptImgSwitchInfo.push(info);
				}
				console.log("info.time :"+ info.time );
				console.log("info.index is :"+ info.index );
				console.log("audioText is :"+ audioText );
				
				this.audioStartTime = null;
				this.audioTextDurationTime = 5;
			}
			else {
				if(this.audioStartTime == null){
					this.audioStartTime = Date.now();
				}
			}
		}
	}
	setTimeoutForClearText() {
		if (this.textUpdateTimeoutID !== 0) {
			clearTimeout(this.textUpdateTimeoutID);
			this.textUpdateTimeoutID = 0;
		}
		this.textUpdateTimeoutID = setTimeout(
			() => {
				this.audioResult.innerHTML = "";
				this.textUpdateTimeoutID = 0;
			}, 
			this.audioTextDurationTime * 1000);
	}
	
	/**
	 * 再生時間が変化するたび、スライダーの位置を更新する
	 **/
	videoTimeupdate(e) {
		if(!this.isPlay && !this.isRecord)
			return;
		var timeSpan = "";
		var timeTmp = 0;
		if(this.isRecord)
		{
			if(this.timeStartVideo ){
				timeTmp = Math.floor((Date.now() - this.timeStartVideo) / 1000);
			}
			timeSpan = ('00'+Math.floor(timeTmp/60)).slice(-2) + ":" + ('00'+timeTmp%60).slice(-2);
		}
		else if(this.isPlay){
			var info ={};
			var lastestIndex = this.lastestIndexSwitchInfos4Play;
			for(var i=lastestIndex; i < this.pptImgSwitchInfo.length; i++)
			{
				info = this.pptImgSwitchInfo[i];
				if(Math.floor(info.time) == Math.floor(this.video.currentTime))
				{
					console.log("currenttime is :"+ this.video.currentTime );
					console.log("info.index is :"+ info.index );
					this.mySwiper.slideTo(info.index, 300, true);
					if(info.audioContent){
						this.audioResult.innerHTML = info.audioContent;
						
						this.audioTextDurationTime = info.audioContentDuration;
						this.setTimeoutForClearText();
					    console.log("info.audioContent is :"+ info.audioContent );
					}
					//最新の切り替え情報のindexの保存
					//this.lastestIndexSwitchInfos4Play = i;
					//break;
				}
			}
			timeTmp = Math.floor(this.video.currentTime);
			timeSpan = ('00'+Math.floor(timeTmp/60)).slice(-2) + ":" + ('00'+timeTmp%60).slice(-2)
						+ '/' 
						+ ('00'+Math.floor(this.videoTotalTime/60)).slice(-2) + ":" + ('00'+this.videoTotalTime%60).slice(-2);
		}
		//再生時刻の設定
		this.spanVideoTime.innerHTML = timeSpan;
	};
    
	changeMemo(activeIdx){
		if(this.isAn){
			let pageId="#page"+activeIdx;
			for(let i=0;i<4;i++){
				let page="#page"+i;
				$(page).removeAttr('class');

			}
			$(pageId).addClass("page"+activeIdx+"-an");
		}
		var txt = '';
		this.localMemos.forEach(function(item, idx){
			if(item.index == activeIdx){
				txt = item.content;
			}
		});		
		//メモ内容の更新
        this.textAreaObject.value = txt;
		//メモのエリアのサイズの更新
		this.textAreaHeightSet();
	}
	setMemoButtons(buttons){		
		var key = buttons[2] + 'localMemos';
		this.memoKey2Save = key; //メモ用キー
		
		var saveMemos = buttons[0];
		var deleteMemos = buttons[1];
		//保存
		saveMemos.onclick = (e) => {
			localStorage.setItem(key, JSON.stringify(this.localMemos));
		};
		//削除
		deleteMemos.onclick = (e) => {
			localStorage.removeItem(key);
			this.updateMemo(key);
		};
		
		this.updateMemo(key);
	}
	updateMemo(key){
		var isFound = false;
		var txt = '';
		var index = this.mySwiper.activeIndex;
		this.localMemos = JSON.parse(localStorage.getItem(key));
		if(this.localMemos && this.localMemos.length > 0){
		    this.localMemos.forEach((item, idx)=>{
				if(!isFound && item.index == index){
					txt = item.content;
					isFound = true;
				}
			});
		}
		else{
			this.localMemos = [];
		}
		//メモ内容の更新
        this.textAreaObject.value = txt;
		//メモのエリアのサイズの更新
		this.textAreaHeightSet();
	}
	setControls(controls){
		//videoの要素
		this.startBtn = controls[0];
		this.stopBtn = controls[1];
		this.playBtn = controls[2];
		this.spanVideoTime = controls[3];
		this.swipeInitialIndex = controls[4];
		
		/**
         * 録画開始する
         **/
		this.startBtn.onclick = (e) => {
			this.isRecord = true;
			this.isPlay = false;
			this.openCamera();
			this.mySwiper.slideTo(this.swipeInitialIndex, 300, false);
			this.updateMemo(this.memoKey2Save);
			this.disabled = true;
			this.stopBtn.disabled = false;
			this.timeStartVideo = Date.now();
			$("#pptBtn").show();
		};
		
        /**
         * 録画完了する
         **/
        this.stopBtn.onclick = (e) => {
			this.stopBtn.disabled = true;

			// 终止录制器
			this.mediaRecorder.stop();
			// 关闭媒体流
			MediaUtils.closeStream(this.mediaStream);
        };
		
		/**
         * 再生する
         **/
        this.playBtn.onclick = (e) => {
            this.playBtn.disabled=true;
            this.toPlay(this.videoFileName);
        };
	}
	
	stopCallback() {
		this.videoTotalTime = Math.floor(this.video.currentTime);
		this.audioInputOff(); //音声入力をOff

		this.startBtn.disabled = false;
		this.playBtn.disabled = false;
        this.lastestIndexSwitchInfos4Play = 0;
							
		//保存
		this.saver();
		this.isRecord = false;
	}

	/**
	 * ウェブカメラをアクティブにする
	 **/
	openCamera() {
		//reset
		this.noteContent = '';
		this.audioResult.innerHTML = '';
		this.spanVideoTime.innerHTML = '00:00';
		this.video.src = '';
		this.video.srcObject = null;
		this.video.muted = true;　//ビデオ録画の時、muteにする
		this.video.controls = false;
		this.pptImgSwitchInfo = [];
        this.lastestIndexSwitchInfos4Play = 0;

		this.startBtn.disabled = true;
		this.playBtn.disabled = true;
		
		MediaUtils.getUserMedia(true, true,  (err, stream)=>{
			if (err) {
				throw err;
			} else {
				// 通过 MediaRecorder 记录获取到的媒体流
				console.log();
				var options = {
					audioBitsPerSecond: 128000,
					videoBitsPerSecond: 2500000  //指定视频比特率
				}
				this.mediaRecorder = new MediaRecorder(stream, options);
				this.mediaStream = stream;
				var chunks = [], startTime = 0;
				this.video.srcObject = stream;
				this.video.src = "";
				this.video.play();

				//videosContainer.appendChild(video);
				this.mediaRecorder.ondataavailable = (e)=> {
					this.mediaRecorder.blobs.push(e.data);
					chunks.push(e.data);
				};
				this.mediaRecorder.blobs = [];

				this.mediaRecorder.onstop = (e)=> {
					this.recorderFile = new Blob(chunks, { 'type': this.mediaRecorder.mimeType });
					chunks = [];
					if (null != this.stopCallback) {
						this.stopCallback();
					}
				};

				this.startRecord();
			}
		});
	}
	
	/**
	 * 録画を開始する
	 **/
	startRecord() {
		this.mediaRecorder.start();
		this.audioInputOn(); //音声入力をOff
	}
	/**
	 * 録画を完了する
	 **/
	 stopRecord(callback) {
		
	}
	/**
	 * 音声入力をOnにする
	 **/
	audioInputOn(){
		initialAudioInput(
			(isFinal, audioText)=>{
				this.audioResultCallback(isFinal, audioText);
			}
		);
		startAudioInput();
		console.log("audioInputOn");
	}
	/**
	 * 音声入力をOffにする
	 **/
	audioInputOff(){
		stopAudioInput();
		console.log("audioInputOff");
	}
	/**
	 * 録画済みのビデオを保存する
	 **/
	saver() {
		this.videoFileName = 'msr-' + (new Date).toISOString().replace(/:|\./g, '-') + '.mp4';
		
		//this.pptImgSwitchInfo.sort((a, b)=>{
		//	return a.time > b.time ? true : false;
		//});
		//切り替え情報の保存
		var info = {};
		info.videoTotalTime = this.videoTotalTime;
		info.switch = this.pptImgSwitchInfo;
		localStorage.setItem(this.videoFileName, JSON.stringify(info));
		
		//ビデオファイルの保存
		var file = new File([this.recorderFile], this.videoFileName, {
			type: 'video/mp4'
		});
		saveAs(file);

	}	
	/**
	 * 録画済みのビデオを作成する
	 **/
	toPlay(filename)
	{
		var info = JSON.parse(localStorage.getItem(this.videoFileName));
		this.pptImgSwitchInfo = info.switch;
		this.videoTotalTime = info.videoTotalTime;
	
		this.mySwiper.slideTo(this.swipeInitialIndex, 300, true);
		
		this.video.src = this.localDestPath + filename;
		this.video.srcObject = null;
		this.video.controls = true;
		this.video.muted = false; //再生の時、非muteにする
		this.video.play();
		
		this.isRecord = false;
		$("#pptBtn").hide();
	}
}

/**
 * 録画用ツール
 **/
var MediaUtils = {
	/**
	* 获取用户媒体设备(处理兼容的问题)
	* @param videoEnable {boolean} - 是否启用摄像头
	* @param audioEnable {boolean} - 是否启用麦克风
	* @param callback {Function} - 处理回调
	*/
	getUserMedia: function (videoEnable, audioEnable, callback) {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
			|| navigator.msGetUserMedia || window.getUserMedia;
		var constraints = { video: videoEnable, audio: audioEnable };
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
				callback(false, stream);
			})['catch'](function (err) {
				callback(err);
			});
		} else if (navigator.getUserMedia) {
			navigator.getUserMedia(constraints, function (stream) {
				callback(false, stream);
			}, function (err) {
				callback(err);
			});
		} else {
			callback(new Error('Not support userMedia'));
		}
	},

	/**
	* 关闭媒体流
	* @param stream {MediaStream} - 需要关闭的流
	*/
	closeStream: function (stream) {
		if (typeof stream.stop === 'function') {
			stream.stop();
		}
		else {
			let trackList = [stream.getAudioTracks(), stream.getVideoTracks()];

			for (let i = 0; i < trackList.length; i++) {
				let tracks = trackList[i];
				if (tracks && tracks.length > 0) {
					for (let j = 0; j < tracks.length; j++) {
						let track = tracks[j];
						if (typeof track.stop === 'function') {
							track.stop();
						}
					}
				}
			}
		}
	}
};