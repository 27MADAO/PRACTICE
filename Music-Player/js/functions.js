// 创建音乐条目的方法
function createMusicItem(i, v) {
  var $item = $("<li class=\"menu-item\">\n" +
    "          <div class=\"song-check\"><i></i></div>\n" +
    "          <div class=\"song-index\"><span>"+ (i+1) +"</span></div>\n" +
    "          <div class=\"song-name\">\n" +
    "            <span title=\"歌曲\">"+ v.name +"</span>\n" +
    "            <div class=\"song-operate\">\n" +
    "              <a class=\"operate-play\" href=\"javascript:;\" title=\"播放\"></a>\n" +
    "              <a class=\"operate-add\" href=\"javascript:;\" title=\"添加到歌单\"></a>\n" +
    "              <a class=\"operate-download\" href=\"javascript:;\" title=\"下载\"></a>\n" +
    "              <a class=\"operate-share\" href=\"javascript:;\" title=\"分享\"></a>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "          <div class=\"song-singer\">\n" +
    "            <a href=\"javascript:;\" title=\"歌手\">"+ v.singer +"</a>\n" +
    "          </div>\n" +
    "          <div class=\"song-duration\">\n" +
    "            <span>"+ v.time +"</span>\n" +
    "            <a class=\"operate-delete\" href=\"javascript:;\" title=\"删除\"></a>\n" +
    "          </div>\n" +
    "        </li>");
  return $item;
}

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

function isNull(v) {
  return (v === undefined || v === null);
  // console.log(isNaN(NaN));
  // 0 false
  // "0" false
  // bol false
  // null false
  // NaN true
  // "t" true
  //undefined true
}