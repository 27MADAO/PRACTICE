(function (window) {
  function Progress($bar) {
    return new Progress.prototype.init($bar);
  }
  Progress.prototype = {
    constructor: Progress,
    moving: false,
    progress: 0,
    init: function ($bar) {
      this.$bar = $bar;
    },
    setMoving: function (bol){
      this.moving = bol;
    },
    // 进度条设置
    setProgress: function (length) {
      this.$bar.find(".progress-track").width(length);
    },
    // 进度条开始
    start: function (callback , bol) {
      this.click(callback);
      this.move(callback, bol);
    },
    // 进度条点击
    click: function (callback){
      var _this = this;
      // 为什么采用mousedown而非click:
      // bar的click事件会被ball的mousedown冒泡触发且较难阻止
      this.$bar.mousedown(function (e) {
        _this.setProgress(e.offsetX);
        callback && callback();
      });
    },
    // 进度条拖动
    // bol: 是否在拖动过程中触发
    move: function (callback, bol) {
      var _this = this;
      this.$bar.find(".progress-ball").mousedown(function (e) {
        _this.setMoving(true);
        var beginP = e.pageX;
        var origin = _this.$bar.find(".progress-track").width();
        var target, whole = _this.$bar.width();
        e.stopPropagation();
        $("body").mousemove(function (e) {
          var moveP = e.pageX;
          var expand = moveP - beginP;
          if(origin + expand > whole){
            target = whole;
          }else if(origin + expand < 0){
            target = 0;
          }else{
            target = origin + expand;
          }
          _this.setProgress(target);
          //拖动中要做的操作
          bol && callback && callback();
        });
        $("body").mouseup(function () {
          $("body").off("mousemove mouseup");
          //拖动后要做的操作
          callback && callback();
          _this.setMoving(false);
        });
      });
    }
  };
  Progress.prototype.init.prototype = Progress.prototype;
  window.Progress = Progress;
})(window);