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