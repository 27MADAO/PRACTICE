(function (window) {
  function Lyric() {
    return new Lyric.prototype.init();
  }
  Lyric.prototype = {
    constructor: Lyric,
    timeArray: [],
    lyricArray: [],
    init: function () {

    },
    resetArray: function(){
      this.timeArray = [];
      this.lyricArray = [];
    },
    loadLyric: function (url, callback) {
      //清空容器和上一首歌数据
      this.resetArray();

      var _this = this;
      $.ajax({
        url: url,
        dataType: "text",
        success: function (data) {
          _this.parseLyric(data);
          // 时间列表克隆一份传出去操作
          var timeArr = JSON.parse(JSON.stringify(_this.timeArray));
          callback && callback(timeArr, _this.lyricArray);
        },
        error: function (e) {
          console.log(e);
        }
      })
    },
    parseLyric: function (data) {
      var array = data.split("\n");
      var timeReg = /(\d*:\d*\.\d*)/;
      var _this = this;
      $.each(array, function (i, v) {
        var arr = v.split(/\[|]/);
        var time = arr[1];
        var lyric = arr[2];
        // 剔除没有时间或歌词的行数据
        if(!time.match(timeReg) || !lyric.trim()) return;
        var timeArr = time.split(":");
        var min = +timeArr[0];
        var sec = +timeArr[1];
        var lyricTime = (min * 60 + sec).toFixed(2);
        _this.timeArray.push(lyricTime);
        _this.lyricArray.push(lyric);
      })
    }
  };
  Lyric.prototype.init.prototype = Lyric.prototype;
  window.Lyric = Lyric;
})(window);