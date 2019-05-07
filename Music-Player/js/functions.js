// 时间转换 s => mm : ss
function parseTime(d) {
  if(!d) return "00:00";
  var hour = Math.floor(d / 3600);
  var minute = Math.floor(d % 3600 / 60);
  var second = Math.floor(d % 60);
  function two(t) {
    return parseInt(t / 10) + "" + t % 10;
  }
  return two(minute) + ":" + two(second);
}

// 歌词解析 => timeArr/lyricArr
function parseLyric(data) {
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

// console.log(isNaN(NaN));
// 0 false
// "0" false
// bol false
// null false
// NaN true
// "t" true
//undefined true
function isNull(v) {
  return (v === undefined || v === null);
}