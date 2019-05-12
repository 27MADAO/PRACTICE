$(function () {
  //_ 使用jQuery滚动条插件
  $(".menu-box").mCustomScrollbar({
    theme:"minimal-dark",
    callbacks:{
      //滚动完毕触发
      onScroll:function(){
        console.log("Content scrolled...");
      }
    }
  });

  // 0 声明变量
  var $audio = $("audio");
  var player = new Player($audio);
  player.setModeList(["circulate", "random", "one"]);
  player.setPlayingMode(player.modeList[0]);

  var $lyricContainer = $(".playing-lyric");
  var lyric = new Lyric();

  var $timeBar = $(".playing-progress-bar");
  var timeProgress = new Progress($timeBar);

  var $volumeBar = $(".playing-volume-bar");
  var volumeProgress = new Progress($volumeBar);
  // 初始化声音进度条长度
  volumeProgress.setProgress(player.playingVolume * $volumeBar.width());

  // 1 加载歌曲列表
  getPlayerList();
  function getPlayerList() {
    $.ajax({
      url: "./source/musiclist.json",
      dataType: "json",
      success: function (data) {
        player.setMusicList(data);
        // 遍历数据，创建音乐列表
        $.each(player.musicList, function (i, v) {
          var $menuItem = createMusicItem(i, v);
          // 添加的jQuery滚动条插件为歌曲列表的ul向内多包裹了几层div
          var $menuContainer = $(".menu-box #mCSB_1_container");
          $menuContainer.append($menuItem);
        });
        // 获取到列表后默认播放第一首
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
    // 1.监听列表操作的勾选事件
    $menu.delegate(".song-check i", "click",function () {
      $(this).parents("li").toggleClass("menu-checked ");
      if($(this).parents(".menu-header").length){
        // 1.1首行勾选决定全部勾选
        if($(".menu-header").hasClass("menu-checked")){
          $(".menu-item").addClass("menu-checked");
        }else{
          $(".menu-item").removeClass("menu-checked");
        }
      }else{
        // 1.2全部勾选则首行勾选
        var $menuListChecked = $(".menu-header").siblings(".menu-checked ");
        if($menuListChecked.length === $(".menu-item").length){
          $(".menu-header").addClass("menu-checked ")
        }else {
          $(".menu-header").removeClass("menu-checked ")
        }
      }
    });

    // 2.监听列表操作的删除按钮点击事件
    $(".menu-operate-delete").click(function () {
      deleteMusic($(".menu-item.menu-checked"));
    });

    // 3.监听列表操作的清空按钮点击事件
    $(".menu-operate-clean").click(function () {
      deleteMusic($(".menu-item"));
    });

    // 4.监听歌曲列表的鼠标移入移出事件
    $menu.delegate(".menu-item", "mouseenter", function () {
      $(this).find(".song-operate, .operate-delete").css({display: "block"});
      $(this).find(".song-duration span").css({display: "none"});
    });
    $menu.delegate(".menu-item", "mouseleave", function () {
      $(this).find(".song-operate, .operate-delete").css({display: "none"});
      $(this).find(".song-duration span").css({display: "block"});
    });

    // 5.监听子菜单的播放/暂停按钮点击事件
    $menu.delegate(".operate-play", "click",function () {
      var itemIndex = $(this).parents(".menu-item").index();
      changeMusic(itemIndex - 1);// index()是从1开始
    });

    // 6.监听子菜单的删除按钮点击事件
    $menu.delegate(".operate-delete", "click",function () {
      deleteMusic($(this).parents(".menu-item"));
    });

    // 7.监听底部菜单的播放/暂停按钮点击事件
    $(".playing-pause").click(function () {
      changeMusic(player.playingIndex);
    });

    // 8.监听底部菜单的上一首按钮点击事件
    $(".playing-pre").click(function () {
      changeMusic(player.playingIndex - 1);
    });

    // 9.监听底部菜单的上一首按钮点击事件
    $(".playing-next").click(function () {
      changeMusic(player.playingIndex + 1);
    });

    // 10.监听播放进行事件
    player.timeUpdate(function (currentTime, duration) {
      // 10.1时间进度条同步
      if(!timeProgress.moving){
        timeProgress.setProgress(currentTime / duration * 100 + "%");
      }
      var $timeSpan = $(".playing-current");
      $timeSpan.text(parseTime(currentTime));

      // 10.2歌词同步
      var lyricIndex = lyric.locateLyric(currentTime);
      if(lyricIndex < 0) return;
      //   高亮当前歌词
      $lyricContainer.children().removeClass("playing-lyric-this");
      var $curLyric = $lyricContainer.children().eq(lyricIndex);
      $curLyric.addClass("playing-lyric-this");
      //   定位当前歌词
      var boxHeight = $lyricContainer.parent().height();
      if($curLyric[0].offsetTop <= boxHeight / 2) return;
      var top = - $curLyric[0].offsetTop + boxHeight / 2 - $curLyric[0].clientHeight / 2;
      $lyricContainer.css({top: top});
      // 哔了狗，为啥animate方法一直类型报错, 暂时没查出来原因
      // $lyricContainer.stop().animate({top: top}, 100);

      // 10.3播完后根据播放模式切换下一首
      if(currentTime >= duration){
        console.log("播完了");
        var nextIndex = {
          circulate: player.playingIndex + 1,
          random: getRandomNext(),
          one: player.playingIndex,
        };
        var musicIndex = nextIndex[player.playingMode];
        musicIndex === player.playingIndex && player.setPlayingIndex(-1);
        changeMusic(musicIndex);
      }
    });

    // 11.监听底部菜单的歌曲进度条的点击、拖动事件
    timeProgress.start(function () {
      var length = $(".playing-progress-bar .progress-track").width();
      player.musicSeekTo(length / $timeBar.width());
    });

    // 12.监听底部菜单的播放模式按钮点击事件
    $(".playing-operate-mode").click(function () {
      player.changeMode();
      var className = "playing-operate-mode playing-mode-" + player.playingMode;
      $(this).attr("class", className);
    });

    // 13.监听底部菜单的纯净模式按钮点击事件
    $(".playing-operate-only").click(function () {
      $(this).toggleClass("playing-only-on playing-only-off");
      if($(this).hasClass("playing-only-on")){
        $(".only-on").css({display: "flex"});
        $(".only-off").css({display: "none"});
        $lyricContainer = $(".only-on .playing-lyric");
      }else{
        $(".only-on").css({display: "none"});
        $(".only-off").css({display: "block"});
        $lyricContainer = $(".only-off .playing-lyric");
      }
    });

    // 14.监听底部菜单的静音按钮点击事件
    $(".playing-operate-volume").click(function () {
      player.volumeSeekTo();
    });

    // 15.监听底部菜单的声音进度条点击、拖动事件
    volumeProgress.start(function () {
      var length = $(".playing-volume-bar .progress-track").width();
      player.volumeSeekTo( length / $volumeBar.width());
    }, true);
  }

  // 3 定义切换歌曲的方法
  function changeMusic(index) {
    console.log(index);

    // 3.1 切换当前播放曲目
    player.playMusic(index);

    // 3.2 样式上修改当前播放曲目
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
      // 清空上一首歌的歌词
      $lyricContainer.html("");
      // 载入当前播放歌曲的歌词
      $.each(lyricArr, function (i, v) {
        var $item = $("<p>"+ v +"</p>");
        $lyricContainer.append($item);
      });
    });

    // 5.切换页面背景
    $(".player-mask").css({backgroundImage: "url("+ music.cover +")"});

    // 3.3 使播放的歌曲滚动到列表可见区域
    var $menuContainer = $(".menu-box #mCSB_1_container");
    var borderTop = - $menuContainer[0].offsetTop;
    var borderBottom = borderTop + $(".menu-box")[0].clientHeight;
    var $playingItem = $(".menu-playing");
    if(!$playingItem || !$playingItem[0]) return;
    var itemPosition = $playingItem[0].offsetTop;
    var itemHeight = $playingItem[0].clientHeight;
    if(itemPosition < borderTop){
      console.log("在上面呢");
      //scrollTop -= (borderTop - itemPosition)
      //emmm这跟我预想的不太一样，行数据高于可视区时不是应该往上滚动减小scrollTop值吗
      //我理解的scrollTop是内容区被滚上去的高度（鼠标滚轮向上滚动），如果展示内容也被滚上去了就该让它滚下来才对吧？
      $(".menu-box").mCustomScrollbar("scrollTo", "+=" + (borderTop - itemPosition));
    }else if(itemPosition + itemHeight > borderBottom){
      console.log("在下面呢");
      //scrollTop += (itemPosition + $playingItem[0].clientHeight - borderBottom)
      $(".menu-box").mCustomScrollbar("scrollTo", "-=" + (itemPosition + itemHeight - borderBottom));
    }else{
      console.log("可见");
    }
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
      if(!player.musicList.length){
        initPage();
      }else if(indexArr.indexOf(playingIndex) > -1){
        changeMusic(player.playingIndex + 1);
      }
    });
  }

  // 5 定义创建音乐条目的方法
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

  // 6 定义初始化页面样式的方法
  function initPage() {
    // 6.1 复原底部播放按钮
    $(".playing-pause").removeClass("playing-play");

    // 6.2 清除底部播放信息
    $(".playing-name").html("^");
    $(".playing-singer").html("^");
    $(".playing-duration").html("^");

    // 6.3 复原侧边专辑封面图片
    $(".playing-info-poster").css({backgroundImage: "url(\"./img/cat.jpg\")"});

    // 6.4 清除侧边歌曲信息
    $(".playing-info-name a").html("^");
    $(".playing-info-singer a").html("^");
    $(".playing-info-album a").html("^");
    $lyricContainer.html("");

    // 6.5 隐藏不含内容的元素
    $("a:contains('^'), span:contains('^')").parent().css({display: "none"});

    // 6.6 页面背景恢复默认
    $(".player-mask").css({backgroundImage: "url(\"./img/cat.jpg\")"});
  }

  // 7 定义获取随机模式中下一首歌曲索引的方法（规定不可为当前播放歌曲的索引）
  function getRandomNext() {
    var randomNext = Math.floor(Math.random() * player.musicList.length);
    if(randomNext === player.playingIndex){
      randomNext = getRandomNext();
    }
    return randomNext;
  }
});
