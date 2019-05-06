(function (window) {
  function Progress($audio) {
    return new Progress.prototype.init($audio);
  }
  Progress.prototype = {
    constructor: Progress,
    moving: false,
    init: function ($audio) {
      this.$audio = $audio;
      this.audio = $audio.get(0);
    },
    setMoving: function (bol){
      this.moving = bol;
    },
    // 进度条开始
    //  start参数：进度条对象；[盛放当前播放时间的容器对象]；[播放结束的回调函数]
    start: function ($bar, $span, callback) {
      var _this = this;
      this.audio.ontimeupdate = function () {
        // 如果没有在手动移动进度条,就让它随音乐移动
        if(!_this.moving){
          $bar.children().width(this.currentTime / this.duration * 100 + "%");
        }
        //显示当前播放时间
        $span && $span.text(parseTime(this.currentTime));
      };
      // 进度条结束要做的事情
      this.audio.onended = function () {
        callback && callback();
      }
    },
    // 进度跳转
    //  move参数: 进度条对象；要修改的目标长度；[是否边改边播]
    //  默认修改进度条的同时修改播放进度,playMaintain为true则保持原歌曲播放进度
    move: function ($bar, length, playMaintain) {
      $bar.children().width(length);
      if(playMaintain) return;
      var ratio = length / $bar.width();
      this.audio.currentTime = this.audio.duration * ratio;
    }
  };
  Progress.prototype.init.prototype = Progress.prototype;
  window.Progress = Progress;
})(window);