$(function () {
  // 0 使用jQuery滚动条插件
  $(".menu-container").mCustomScrollbar();

  var $audio = $("audio");
  var audio = $audio.get(0);

  var progress = new Progress($audio);
  var $progressBar = $(".playing-progress-bar");
  var $progressSpan = $(".playing-current");
  progress.start($progressBar, $progressSpan, function (){
    changeMusic(player.playingIndex + 1);
  });

  var player = new Player($audio);
  var $volumeBar = $(".playing-volume-bar");
  changeVolume(player.playingVolume * $volumeBar.width());

  var lyric = new Lyric();
  var $lyricContainer = $(".playing-lyric");


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
      changeMusic(itemIndex - 1);// index()是从1开始
    });

    // 4.监听子菜单删除按钮的点击
    $menu.delegate(".operate-delete", "click",function () {
      var musicIndex = $(this).parents(".menu-item").index() - 1;
      // 4.1样式上移除
      $(this).parents(".menu-item").remove();
      //    更新索引
      $.each($(".menu-item"), function (i, v) {
        $(v).find(".song-index span").text(i+1);
      });
      // 4.2逻辑上移除
      player.removeMusic(musicIndex, function () {
        changeMusic(musicIndex);
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

    // 8.监听进度条的点击
    // 为什么采用mousedown而非click: bar的click事件会被ball的mousedown冒泡触发且较难阻止
    $(".playing-progress-bar").mousedown(function (e) {
      progress.move($progressBar, e.offsetX);
    });

    // 9.监听进度条的拖动
    $(".playing-progress-ball").mousedown(function (e) {
      progress.setMoving(true);
      var beginP = e.pageX;
      var origin = $(".playing-progress-track").width();
      var target, whole = $progressBar.width();
      //阻止冒泡触发bar的mousedown事件
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
        progress.move($progressBar, target, true);
      });
      $("body").mouseup(function () {
        $("body").off("mousemove mouseup");
        progress.move($progressBar, target);
        progress.setMoving(false);
      });
    });

    // 10.监听声音图标的点击
    $(".playing-operate-volume").click(function () {
      changeVolume();
    });

    // 11.监听声音进度条的点击
    $(".playing-volume-bar").mousedown(function (e) {
      changeVolume(e.offsetX);
    });

    // 12.监听声音进度条的拖动
    $(".playing-volume-ball").mousedown(function (e) {
      var beginP = e.pageX;
      var origin = $(".playing-volume-track").width();
      var target, whole = $(".playing-volume-bar").width();
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
        changeVolume(target);
      });
      $("body").mouseup(function () {
        $("body").off("mousemove mouseup");
      });
    });
  }

  // 切换歌曲的方法
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

    // 4.侧边显示当前播放曲目歌词等
    $(".playing-info-poster").css({backgroundImage: "url("+ cover +")"});
    $(".playing-info-name a").text(name);
    $(".playing-info-singer a").text(singer);
    $(".playing-info-album a").text(album);
    lyric.loadLyric(lyricUrl, function (timeArr, lyricArr) {
      //清空上一首歌的歌词
      $lyricContainer.html("");
      //载入当前播放歌曲的歌词
      $.each(lyricArr, function (i, v) {
        var $item = $("<p>"+ v +"</p>");
        $lyricContainer.append($item);
      });
      //高亮当前播放句
      var index = -1;
      player.playUpdate(function (currentTime) {
        if(currentTime >= timeArr[0]){
          index ++;
          timeArr.shift();
        }
        $lyricContainer.children().removeClass("playing-lyric-this");
        $lyricContainer.children().eq(index).addClass("playing-lyric-this");
        if(index <= 2) return;
        var boxHeight = $(".playing-lyric-box").height();
        var top = $lyricContainer.children().get(index).offsetTop;
        var height = $lyricContainer.children().get(index).clientHeight;
        $lyricContainer.animate({top: - top + boxHeight / 2 - height / 2}, 100);
      });
    });

    // 5.切换页面背景
    $(".player-mask").css({backgroundImage: "url("+ cover +")"});
  }

  // 调节音量的方法
  function changeVolume(length) {
    if(isNull(length)){
      // 静音按钮
      audio.volume = audio.volume > 0 ? 0 : player.playingVolume;
      if(audio.volume !== 0){
        player.setPlayingVolume(audio.volume);
      }
    }else{
      // 滑块调节
      $(".playing-volume-track").width(length);
      audio.volume = length / $volumeBar.width();
      player.setPlayingVolume(audio.volume);
    }

    if(audio.volume === 0){
      $(".playing-operate-volume").addClass("playing-operate-quiet");
    }else{
      $(".playing-operate-volume").removeClass("playing-operate-quiet");
    }
  }
});
