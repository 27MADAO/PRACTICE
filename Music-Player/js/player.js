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
      var playingIndex = this.playingIndex;
      if(musicIndex <= playingIndex){
        this.setPlayingIndex(playingIndex - 1);
      }
      this.musicList.splice(musicIndex, 1);
      //如果删除的是当前播放的歌曲,则删除后自动播放随后一首
      // 由于涉及样式变化,切换歌曲的工作不直接在这里做
      if(musicIndex === playingIndex){
        callback && callback();
      }
    },
    // 播放进程
    playUpdate: function (callback) {
      var _this = this;
      this.audio.ontimeupdate = function () {
        callback && callback(_this.audio.currentTime);
      }
    }
  };

  Player.prototype.init.prototype = Player.prototype;
  window.Player = Player;
})(window);