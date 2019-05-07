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
    // 1.监听歌曲列表鼠标移入移出事件
    $menu.delegate(".menu-item", "mouseenter", function () {
      $(this).find(".song-operate, .operate-delete").css({display: "block"});
      $(this).find(".song-duration span").css({display: "none"});
    });
    $menu.delegate(".menu-item", "mouseleave", function () {
      $(this).find(".song-operate, .operate-delete").css({display: "none"});
      $(this).find(".song-duration span").css({display: "block"});
    });

    // 2.监听歌曲列表勾选事件
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
        if($menuListChecked.length + 1 === $(".menu-item").length){
          $(".menu-header").addClass("menu-checked ")
        }else {
          $(".menu-header").removeClass("menu-checked ")
        }
      }
    });

    // 3.监听子菜单播放/暂停按钮的点击
    $menu.delegate(".operate-play", "click",function () {
      var itemIndex = $(this).parents(".menu-item").index();
      changeMusic(itemIndex - 1);// lyricIndex()是从1开始
    });

    // 4.监听子菜单删除按钮的点击
    $menu.delegate(".operate-delete", "click",function () {
      var musicIndex = $(this).parents(".menu-item").index() - 1;
      // 4.1样式上移除
      $(this).parents(".menu-item").remove();
       //    更新索引
      $.each($(".menu-item"), function (i, v) {
        $(v).find(".song-index span").text(i + 1);
      });
      // 4.2逻辑上移除
      player.removeMusic(musicIndex, function (playingIndex) {
        if(musicIndex === playingIndex){
          changeMusic(musicIndex);
        }
      });
    });

    // 5.监听底部菜单播放/暂停按钮的点击
    $(".playing-pause").click(function () {
      changeMusic(player.playingIndex);
    });

    // 6.监听底部菜单上一首按钮的点击
    $(".playing-pre").click(function () {
      changeMusic(player.playingIndex - 1);
    });

    // 7.监听底部菜单上一首按钮的点击
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
      var curLyric = $lyricContainer.children().get(lyricIndex);
      $lyricContainer.children().removeClass("playing-lyric-this");
      $curLyric.addClass("playing-lyric-this");
      var boxHeight = $(".playing-lyric-box").height();
      var top = - curLyric.offsetTop + boxHeight / 2 - curLyric.clientHeight / 2;
      if(top > 0) return;
      $lyricContainer.css({top: top});
      // 哔了狗了，为啥animate方法一直类型报错
      // $lyricContainer.stop().animate({top: top}, 100);

      // 8.3播完自动切换下一首
      if(currentTime >= duration){
        changeMusic(player.playingIndex + 1);
      }
    });

    // 9.初始化歌曲进度条事件
    timeProgress.start(function () {
      var length = $(".playing-progress-bar .progress-track").width();
      player.musicSeekTo(length / $timeBar.width());
    });

    // 10.监听声音图标的点击
    $(".playing-operate-volume").click(function () {
      player.volumeSeekTo();
    });

    // 11.初始化声音进度条事件
    volumeProgress.start(function () {
      var length = $(".playing-volume-bar .progress-track").width();
      player.volumeSeekTo( length / $volumeBar.width());
    }, true);

    // 12.监听列表操作的删除按钮事件
    $(".menu-operate-delete").click(function () {
      deleteMusic($(".menu-item.menu-checked"));
    });
  }

  // 3 定义切换歌曲的方法
  function changeMusic(index) {
    //切换当前播放曲目
    player.playMusic(index);

    //样式上修改当前播放曲目
    // 1.列表中设置当前播放曲目高亮
    var $curMenuItem = $(".menu-item").eq(player.playingIndex);
    if(player.playing){
      $curMenuItem.addClass("menu-playing");
    }else {
      $curMenuItem.removeClass("menu-playing");
    }
    $curMenuItem.siblings().removeClass("menu-playing");

    // 2.底部播放按钮改变
    if(player.playing){
      $(".playing-pause").addClass("playing-play");
    }else {
      $(".playing-pause").removeClass("playing-play");
    }

    // 3.底部显示当前播放曲目信息等
    var name = player.musicList[player.playingIndex].name;
    var singer = player.musicList[player.playingIndex].singer;
    var time = player.musicList[player.playingIndex].time;
    var cover = player.musicList[player.playingIndex].cover;
    var album = player.musicList[player.playingIndex].album;
    var lyricUrl = player.musicList[player.playingIndex].link_lrc;
    $(".playing-name").text(name);
    $(".playing-singer").text(singer);
    $(".playing-duration").text(time);

    // 4.侧边显示当前播放曲目歌词信息等
    $(".playing-info-poster").css({backgroundImage: "url("+ cover +")"});
    $(".playing-info-name a").text(name);
    $(".playing-info-singer a").text(singer);
    $(".playing-info-album a").text(album);
    lyric.loadLyric(lyricUrl, function (lyricArr) {
      //清空上一首歌的歌词
      $lyricContainer.html("");
      //载入当前播放歌曲的歌词
      $.each(lyricArr, function (i, v) {
        var $item = $("<p>"+ v +"</p>");
        $lyricContainer.append($item);
      });
    });

    // 5.切换页面背景
    $(".player-mask").css({backgroundImage: "url("+ cover +")"});
  }
  
  // 4 定义删除歌曲的方法
  function deleteMusic($items) {
    var indexs = [];
    $.each($items, function (i, v) {
      indexs.push($(v).index() - 1);
    });
    player.removeMusic(indexs, function (playingIndex) {
      if(indexs.indexOf(playingIndex) > 0){
        changeMusic(indexs[indexs.length - 1] + 1);
      }
    });

    // 4.1样式上移除
    $items.remove();
    //    更新索引
    $.each($(".menu-item"), function (i, v) {
      $(v).find(".song-index span").text(i + 1);
    });
    // 4.2逻辑上移除
    // player.removeMusic(musicIndex, function (playingIndex) {
    //   if(musicIndex === playingIndex){
    //     changeMusic(musicIndex);
    //   }
    // });
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
});
