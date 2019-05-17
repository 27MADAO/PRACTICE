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
    loadLyric: function (url, callback) {
      var _this = this;
      $.ajax({
        url: url,
        dataType: "text",
        success: function (data) {
          var res = _this.parseLyric(data);
          _this.timeArray = res.time;
          _this.lyricArray = res.lyric;
          callback && callback(_this.lyricArray);
        },
        error: function (e) {
          console.log(e);
        }
      })
    },

    locateLyric: function (time) {
      var index = -1;
      $.each(this.timeArray, function (i, v) {
        if(time >= v){
          index = i;
        }
      });
      return index;
    },

    // 歌词解析 => timeArr/lyricArr
    parseLyric: function (data) {
      var array = data.split("\n");
      var timeReg = /(\d*:\d*\.\d*)/;
      var res = {time:[], lyric: []};
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
        res.time.push(lyricTime);
        res.lyric.push(lyric);
      });
      return res;
    }
  };
  Lyric.prototype.init.prototype = Lyric.prototype;
  window.Lyric = Lyric;
})(window);