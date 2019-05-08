$(function () {
  // 0 变量声明
  var $audio = $("audio");
  var player = new Player($audio);

  var $lyricContainer = $(".playing-lyric");
  var lyric = new Lyric();

  var $timeBar = $(".playing-progress-bar");
  var timeProgress = new Progress($timeBar);

  var $volumeBar = $(".playing-volume-bar");
  var volumeProgress = new Progress($volumeBar);
  // 初始化声音进度条长度
  volumeProgress.setProgress(player.playingVolume * $volumeBar.width());
  // 使用jQuery滚动条插件
  $(".menu-container").mCustomScrollbar();

  // 1 加载歌曲列表
  getPlayerList();
  function getPlayerList() {
    $.ajax({
      url: "./source/musiclist.json",
      dataType: "json",
      success: function (data) {
        // 遍历数据，创建音乐列表
        //  添加的jQuery滚动条插件为ul向内多包裹了一层div
        var $menuContainer = $(".menu-box #mCSB_1_container");
        $.each(data, function (i, v) {
          player.setMusicList(data);
          var $menuItem = createMusicItem(i, v);
          $menuContainer.append($menuItem);
        });
        changeMusic(0);
      },
      error: function (e) {
        console.log(e);
      }
    });
  }

  // 2 初始化事件
  initEvents();
  function initEvents() {
    var $menu = $(".menu-box");
    // 2.监听列表操作的勾选事件
    $menu.delegate(".song-check i", "click",function () {
      $(this).parents("li").toggleClass("menu-checked ");
      if($(this).parents(".menu-header").length){
        // 2.1首行勾选决定全部勾选
        if($(".menu-header").hasClass("menu-checked")){
          $(".menu-item").addClass("menu-checked");
        }else{
          $(".menu-item").removeClass("menu-checked");
        }
      }else{
        // 2.2全部勾选则首行勾选
        var $menuListChecked = $(".menu-header").siblings(".menu-checked ");
        if($menuListChecked.length === $(".menu-item").length){
          $(".menu-header").addClass("menu-checked ")
        }else {
          $(".menu-header").removeClass("menu-checked ")
        }
      }
    });

    // 12.监听列表操作的删除按钮点击事件
    $(".menu-operate-delete").click(function () {
      deleteMusic($(".menu-item.menu-checked"));
    });

    // 3.监听列表操作的清空按钮点击事件
    $(".menu-operate-clean").click(function () {
      deleteMusic($(".menu-item"));
    });

    // 1.监听歌曲列表的鼠标移入移出事件
    $menu.delegate(".menu-item", "mouseenter", function () {
      $(this).find(".song-operate, .operate-delete").css({display: "block"});
      $(this).find(".song-duration span").css({display: "none"});
    });
    $menu.delegate(".menu-item", "mouseleave", function () {
      $(this).find(".song-operate, .operate-delete").css({display: "none"});
      $(this).find(".song-duration span").css({display: "block"});
    });

    // 3.监听子菜单的播放/暂停按钮点击事件
    $menu.delegate(".operate-play", "click",function () {
      var itemIndex = $(this).parents(".menu-item").index();
      changeMusic(itemIndex - 1);// index()是从1开始
    });

    // 4.监听子菜单的删除按钮点击事件
    $menu.delegate(".operate-delete", "click",function () {
      deleteMusic($(this).parents(".menu-item"));
    });

    // 5.监听底部菜单的播放/暂停按钮点击事件
    $(".playing-pause").click(function () {
      changeMusic(player.playingIndex);
    });

    // 6.监听底部菜单的上一首按钮点击事件
    $(".playing-pre").click(function () {
      changeMusic(player.playingIndex - 1);
    });

    // 7.监听底部菜单的上一首按钮点击事件
    $(".playing-next").click(function () {
      changeMusic(player.playingIndex + 1);
    });

    //8.监听播放进行事件
    player.timeUpdate(function (currentTime, duration) {
      // 8.1时间进度条同步
      if(!timeProgress.moving){
        timeProgress.setProgress(currentTime / duration * 100 + "%");
      }
      var $timeSpan = $(".playing-current");
      $timeSpan.text(parseTime(currentTime));

      // 8.2歌词同步
      var lyricIndex = lyric.locateLyric(currentTime);
      if(lyricIndex < 0) return;
      var $curLyric = $lyricContainer.children().eq(lyricIndex);
      $lyricContainer.children().removeClass("playing-lyric-this");
      $curLyric.addClass("playing-lyric-this");
      var boxHeight = $(".playing-lyric-box").height();
      var top = - $curLyric[0].offsetTop + boxHeight / 2 - $curLyric[0].clientHeight / 2;
      if(top > 0) return;
      $lyricContainer.css({top: top});
      // 哔了狗，为啥animate方法一直类型报错, 暂时没查出来原因
      // $lyricContainer.stop().animate({top: top}, 100);

      // 8.3播完后根据播放模式切换下一首
      if(currentTime >= duration){
        var reg = /playing-mode-([a-z]*)/;
        var $playMode = $(".playing-operate-mode");
        var curMode = reg.exec($playMode.attr("class"));
        var nextIndex = {
          circulate: player.playingIndex + 1,
          random: Math.floor(Math.random() * player.musicList.length),
          one: player.playingIndex,
        };
        curMode[1] === "one" && player.setPlayingIndex(-1);
        changeMusic(nextIndex[curMode[1]]);
      }
    });

    // 9.监听底部菜单的歌曲进度条的点击、拖动事件
    timeProgress.start(function () {
      var length = $(".playing-progress-bar .progress-track").width();
      player.musicSeekTo(length / $timeBar.width());
    });

    // 8.监听底部菜单的播放模式按钮点击事件
    $(".playing-operate-mode").click(function () {
      var modes = ["playing-mode-circulate", "playing-mode-one", "playing-mode-random"];
      var reg = /playing-mode-[a-z]*/;
      var curMode = reg.exec($(this).attr("class"));
      var next = (modes.indexOf(curMode[0]) + 1) % modes.length;
      $(this).toggleClass(curMode[0] + " " + modes[next]);
    });
    // 10.监听底部菜单的纯净模式按钮点击事件

    // 10.监听底部菜单的静音按钮点击事件
    $(".playing-operate-volume").click(function () {
      player.volumeSeekTo();
    });

    // 11.监听底部菜单的声音进度条点击、拖动事件
    volumeProgress.start(function () {
      var length = $(".playing-volume-bar .progress-track").width();
      player.volumeSeekTo( length / $volumeBar.width());
    }, true);
  }

  // 3 定义切换歌曲的方法
  function changeMusic(index) {
    // if(!player.musicList.length) return;
    //切换当前播放曲目
    player.playMusic(index);

    //样式上修改当前播放曲目
    // 1.列表中设置当前播放曲目高亮
    $(".menu-item").removeClass("menu-playing");
    var $curMenuItem = $(".menu-item").eq(player.playingIndex);
    player.playing && $curMenuItem.addClass("menu-playing");

    // 2.底部播放按钮改变
    if(player.playing){
      $(".playing-pause").addClass("playing-play");
    }else {
      $(".playing-pause").removeClass("playing-play");
    }

    // 3.底部显示当前播放曲目信息等
    var music = player.musicList[player.playingIndex];
    $(".playing-name").text(music.name);
    $(".playing-singer").text(music.singer);
    $(".playing-duration").text(music.time);

    // 4.侧边显示当前播放曲目歌词信息等
    $(".playing-info-poster").css({backgroundImage: "url("+ music.cover +")"});
    $(".playing-info-name a").text(music.name);
    $(".playing-info-singer a").text(music.singer);
    $(".playing-info-album a").text(music.album);
    lyric.loadLyric(music.link_lrc, function (lyricArr) {
      //清空上一首歌的歌词
      $lyricContainer.html("");
      //载入当前播放歌曲的歌词
      $.each(lyricArr, function (i, v) {
        var $item = $("<p>"+ v +"</p>");
        $lyricContainer.append($item);
      });
    });

    // 5.切换页面背景
    $(".player-mask").css({backgroundImage: "url("+ music.cover +")"});
  }
  
  // 4 定义删除歌曲的方法
  function deleteMusic($item) {
    // 4.1获取移除元素的索引
    var indexArr = [];
    $.each($item, function (i, v) {
      indexArr.push($(v).index() - 1);
    });
    // 4.2样式上移除
    $item.remove();
    // 4.3更新剩余元素的索引
    $.each($(".menu-item"), function (i, v) {
      $(v).find(".song-index span").text(i + 1);
    });
    // 4.4逻辑上移除
    player.removeMusic(indexArr, function (playingIndex) {
      if(indexArr.indexOf(playingIndex) > -1){
        changeMusic(player.playingIndex + 1);
      }
    });
  }

  // 4 定义创建音乐条目的方法
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

  // 获取当前播放模式的方法

  // 获取相应播放模式的下一首歌曲索引的方法
  function indexWithMode() {
    var reg = /playing-mode-([a-z]*)/;
    var $playMode = $(".playing-operate-mode");
    var curMode = reg.exec($playMode.attr("class"));
    var nextIndex = {
      circulate: player.playingIndex + 1,
      random: Math.floor(Math.random() * player.musicList.length),
      one: player.playingIndex,
    };
    return nextIndex[curMode[1]];
  }
});
