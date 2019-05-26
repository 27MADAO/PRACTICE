$(function () {
  //监听规则点开按钮的点击
  $(".rule-open").click(function () {
    $(".rule-mask").stop().fadeIn(100);
  });
  //监听规则关闭按钮的点击
  $(".rule-close").click(function () {
    $(".rule-mask").stop().fadeOut(100);
  });
  //监听游戏开始按钮的点击
  $(".game-start").click(function () {
    //3.1隐藏游戏开始按钮
    $(".game-start, .rule").css({display: "none"});
    //3.2进入游戏程序
    gameProcess();
  });
  //监听重新开始按钮的点击
  $(".game-renew").click(function () {
    //4.1关闭游戏结束页面
    $(".over-mask").stop().fadeOut(100);
    //4.2进入游戏程序
    gameProcess();
  });
  //监听游戏结束按钮得点击
  $(".game-over").click(function () {
    $(".over-mask").stop().fadeOut(100);
    //1.初始化分数
    $(".score").text(0);
    //2.初始化进度条
    $(".progress").width("");
    //3.显示游戏开始按钮
    $(".game-start, .rule").css({display: "block"});
  });
  //游戏进程
  function gameProcess() {
    //1.初始化分数
    $(".score").text(0);
    //2.初始化进度条
    $(".progress").width("");
    //3.进度条开始读秒
    window.progressTimer = setInterval(function () {
      //3.1进度条计时
      var $progressWidth = $(".progress").width();
      $(".progress").width($progressWidth - 3);
      //3.2进度条结束则游戏结束
      if($progressWidth <= 0){ gameOver();}
    },1000);
    //4.地鼠开始出现
    window.moleTimer = setInterval(moleAnimate, 2000);
  }
  //游戏计分规则
  function gameRule($mole){
    $mole.one("click", function () {
      var $score = + $(".score").text();
      var $progress = $(".progress").width();
      if(/h/.test($(this).attr("src"))){
        //击中灰太狼，加10分，加1秒
        $(".score").text($score + 10);
        $(".progress").width($progress + 3);
      }else{
        //击中小灰灰，扣10分，扣1秒
        $(".score").text($score - 10);
        $(".progress").width($progress - 3);
      }
      //检查本次击中后的分数
      if(+ $(".score").text() < 0){
        gameOver();
      }
    });
  }
  //游戏结束
  function gameOver() {
    //画面停止
    clearInterval(window.progressTimer);
    clearInterval(window.moleTimer);
    //地鼠消失
    $(".mole").remove();
    //结束页面出现
    $(".over-mask").stop().fadeIn(100);
    //统计分数
    var $score = $(".score").text();
    $(".over-score>span").text($score);
  }
  //地鼠动画(单次出现动画)
  function moleAnimate(){
    var htl = ["img/h0.png", "img/h1.png", "img/h2.png", "img/h3.png", "img/h4.png",
      "img/h5.png", "img/h6.png", "img/h7.png", "img/h8.png", "img/h9.png"];
    var xhh = ["img/x0.png", "img/x1.png", "img/x2.png", "img/x3.png", "img/x4.png",
      "img/x5.png", "img/x6.png", "img/x7.png", "img/x8.png", "img/x9.png"];
    var position = [{left: 100, top: 116}, {left: 20, top: 161}, {left: 190, top: 143}, {left: 105, top: 193},
      {left: 18, top: 222}, {left: 201, top: 213}, {left: 121, top: 275}, {left: 32, top: 295}, {left: 209, top: 296}];
    //1.随机出灰太狼还是小灰灰
    var moleType = Math.round(Math.random()) > 0 ? htl : xhh;
    //2.随机选出一个坐标
    var cooIndex = Math.floor(Math.random() * 9);
    //3.生成地鼠
    // 3.1创建地鼠
    var $mole = $("<img class='mole' src=''/>");
    // 3.2设置地鼠出现位置
    $mole.css(position[cooIndex]);
    // 3.3设置地鼠出现动画
    var moleIndex = 0;
    var timer = setInterval(function () {
      if(moleIndex > 5){
        //地鼠动画结束（当前画面停留1s，然后移除地鼠）
        clearInterval(timer);
        setTimeout(function () {
          $mole.remove();
        }, 1000);
      }else{
        $mole.attr("src", moleType[moleIndex++]);
      }
    },20);
    //3.4添加地鼠
    $(".box").append($mole);
    //4.为地鼠绑定游戏计分规则
    gameRule($mole);
  }
});