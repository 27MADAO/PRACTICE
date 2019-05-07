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
          var res = parseLyric(data);
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
    }
  };
  Lyric.prototype.init.prototype = Lyric.prototype;
  window.Lyric = Lyric;
})(window);