(function (window) {
  function Player($audio) {
    return new Player.prototype.init($audio);
  }
  Player.prototype = {
    constructor: Player, // ?
    audio: null, //播放器
    musicList: [], //播放列表
    modeList: [], //播放模式列表
    playing: false, //播放状态
    playingVolume: null, //播放的音量
    playingIndex: null, //当前播放曲目
    playingMode: null, //当前播放模式
    init: function ($audio) {
      this.$audio = $audio;
      this.audio = $audio.get(0);
      this.playingVolume = this.audio.volume;
    },
    setMusicList: function (musicList) {
      this.musicList = musicList;
    },
    setModeList: function (modeList){
      this.modeList = modeList;
    },
    setPlaying: function (bol){
      this.playing = bol;
    },
    setPlayingIndex: function (musicIndex){
      this.playingIndex = musicIndex;
    },
    setPlayingVolume: function (volume){
      this.playingVolume = volume;
    },
    setPlayingMode: function(mode){
      this.playingMode = mode;
    },

    // 根据索引播放音乐
    playMusic: function (musicIndex) {
      //处理上一首/下一首传来的musicIndex
      musicIndex = this.musicList.length ? (musicIndex + this.musicList.length) % this.musicList.length : -1;
      if(this.playingIndex === musicIndex){
        if(this.audio.paused){
          this.audio.play();
        }else{
          this.audio.pause();
        }
      }else{
        this.setPlayingIndex(musicIndex);
        this.audio.src = this.musicList[musicIndex].link_url;
        this.audio.play();
      }
      this.setPlaying(!this.audio.paused);
    },

    // 根据索引移除音乐
    removeMusic: function (musicIndex, callback) {
      //包装成数组处理
      var indexArr = musicIndex instanceof Array ? musicIndex : [musicIndex];

      //如果要全部删除就终止当前的播放
      if(indexArr.length === this.musicList.length){
        this.playing && this.playMusic(this.playingIndex);
      }

      var playingIndex = this.playingIndex;
      if(indexArr.indexOf(playingIndex) > -1){
        this.setPlayingIndex(indexArr[0] - 1);
      }else{
        if(indexArr.length - 1  < playingIndex){
          this.setPlayingIndex(playingIndex - indexArr.length);
        }
      }
      this.musicList.splice(indexArr[0], indexArr.length);
      //将删除歌曲时正在播放的歌曲索引传过去
      callback && callback(playingIndex);
    },

    // 播放进程
    timeUpdate: function (callback) {
      var _this = this;
      this.audio.ontimeupdate = function () {
        if(_this.audio.currentTime >=  _this.audio.duration){
          _this.setPlaying(false);
        }
        callback && callback(_this.audio.currentTime, _this.audio.duration);
      };
    },

    // 调整播放进度
    musicSeekTo: function (ratio){
      this.audio.currentTime = ratio * this.audio.duration;
    },

    // 调整播放声音
    volumeSeekTo: function (ratio){
      if(isNull(ratio)){
        // 静音按钮
        this.audio.volume = this.audio.volume > 0 ? 0 : this.playingVolume;
      }else{
        // 滑块调节
        this.setPlayingVolume(ratio);
        this.audio.volume = this.playingVolume;
      }
    },

    // 切换播放模式
    changeMode: function () {
      var index = this.modeList.indexOf(this.playingMode);
      var next = (index + 1) % this.modeList.length;
      this.setPlayingMode(this.modeList[next]);
    }
  };

  Player.prototype.init.prototype = Player.prototype;
  window.Player = Player;
})(window);