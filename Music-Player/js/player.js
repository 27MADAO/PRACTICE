(function (window) {
  function Player($audio) {
    return new Player.prototype.init($audio);
  }
  Player.prototype = {
    constructor: Player, // ?
    audio: null, //播放器
    musicList: [], //播放列表
    playing: false, //播放状态
    playingIndex: null, //正在播放曲目
    playingVolume: null, //播放的音量
    init: function ($audio) {
      this.$audio = $audio;
      this.audio = $audio.get(0);
      this.playingVolume = this.audio.volume;
    },
    setMusicList: function (musicList) {
      this.musicList = musicList;
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

    // 根据索引播放音乐
    playMusic: function (musicIndex) {
      //处理上一首/下一首传来的musicIndex
      musicIndex = (musicIndex + this.musicList.length ) % this.musicList.length;

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
      musicIndex = musicIndex instanceof Array ? musicIndex : [musicIndex];
      var playingIndex = this.playingIndex;
      if(musicIndex.indexOf(playingIndex) > 0){
        var d = musicIndex.length - musicIndex.indexOf(playingIndex);
        this.setPlayingIndex(playingIndex - d);
      }else{
        if(musicIndex.length - 1  <= playingIndex){
          this.setPlayingIndex(playingIndex - musicIndex.length);
        }
      }
      this.musicList.splice(musicIndex, musicIndex.length);
      //将删除歌曲时正在播放的歌曲索引传过去
      callback && callback(playingIndex);
    },

    // 播放进程
    timeUpdate: function (callback) {
      var _this = this;
      this.audio.ontimeupdate = function () {
        callback && callback(_this.audio.currentTime, _this.audio.duration);
      };
      this.audio.onended = function () {
        _this.setPlaying(false);
      }
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
  };

  Player.prototype.init.prototype = Player.prototype;
  window.Player = Player;
})(window);