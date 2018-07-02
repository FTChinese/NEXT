/**
 * 跟踪页面停留时间
 * 如果跨浏览器，totalTime从头开始执行
 */

// 如果cookie中有time，证明是新打开的页面，否则是第一次打开公司网站。 用户刷新时，GetCookie('totalT')也是存在
var totalTime = 0;
if(!!GetCookie('totalT')){
    // totalTime = localStorage.getItem('totalT');
    totalTime = GetCookie('totalT');
}else{
    totalTime = 0;
}

// 如果隐藏页面（包括最小化和在后台标签中），则totalTime不继续进行累加
var interval = window.setInterval(function () {
    if(document.hidden){ 
      console.log('totalTime:'+totalTime);
    }else{
    //   totalTime = localStorage.getItem('totalT');
      totalTime = GetCookie('totalT'); 
      totalTime++;
    //   SetCookie ('totalT', totalTime , 24 , '/' , null);
      document.cookie = 'totalT='+totalTime+';path=/';
    //   localStorage.setItem('totalT', totalTime);
      console.log('totalTime add:'+totalTime);
    }
    // 这个可以证明假如一直待机状态，证明没有执行js文件，也就是没再打开过页面，这个时候totalTime=0；但是cookie还在，2天之后来关闭浏览器post的时候可以读取cookie值
    if(totalTime>86400){
        // var tjArr = localStorage.getItem('jsArr') ? localStorage.getItem('jsArr') : '[{}]';
        // tjArr = JSON.parse(tjArr);
        // postVal(tjArr);
        window.clearInterval(interval);  
        totalTime = 0;
    }
}, 1000);


// post中的变量包含单个页面使用的时间和整个域名浏览时间 。obj中包含url、refer、totalTime、timeIn、timeOut、userId
// localStorage.removeItem('jsArr'); 我觉得可以在24小时之后

function postVal(obj){
    var userId = GetCookie('USER_ID') || '';
    if (!!userId){
        var xhrpw = new XMLHttpRequest();
        xhrpw.open('post', '/engagement.php');
        xhrpw.setRequestHeader('Content-Type', 'application/text');
        xhrpw.onload = function() {
            if (xhrpw.status === 200) {
                // var data = xhrpw.responseText;
                console.log('请求成功:');
            } else {
                alert('请求失败！');
            }
        };     
        xhrpw.send(JSON.stringify(obj));
    }
}

/**
 * 有三种思路：
 * 1. 按页面post，仅仅post此页面相关数据
 * 2. 按天post
 * 3. 2种情况同时post
 * 这个是怎么样给商家？给页面呢还是给统计数据
 * 
 * 加载的时候就应该setItem，假如仅仅打开一个页面并且还么关闭，则onbeforeunload不会执行，
 */ 
function getBrowserTime(){
    var timeIn = '';
    window.onload = function () {
        timeIn = (new Date()).getTime();
        
        // var tjArr = localStorage.getItem("jsArr") ? localStorage.getItem("jsArr") : '[]';
        var dataArr = {
            'url' : location.href,
            'totalTime' : localStorage.getItem('totalT')||GetCookie('totalT')||'',
            'refer' : document.referrer,
            'timeIn' : timeIn,
            'timeOut' : new Date().getTime(),
            'userId' : GetCookie('USER_ID') || null
        };
        postVal(dataArr);
        // tjArr = JSON.parse(tjArr);
        // tjArr.push(dataArr);
        // var tjArr1= JSON.stringify(tjArr);
        // localStorage.setItem("jsArr", tjArr1);
    };
// 根据当天时间，分析出totalTime
    window.onbeforeunload = function() {
        // var tjArr = localStorage.getItem('jsArr') ? localStorage.getItem('jsArr') : '[{}]';
        var dataArr = {
            'url' : location.href,
            'totalTime' : localStorage.getItem('totalT')||GetCookie('totalT'),
            'refer' : document.referrer,
            'timeIn' : timeIn,
            'timeOut' : new Date().getTime(),
            'userId' : GetCookie('USER_ID') || null
        };
        postVal(dataArr);

        // tjArr = JSON.parse(tjArr);
        // tjArr.push(dataArr);
        // tjArr= JSON.stringify(tjArr);
        // localStorage.setItem('jsArr', tjArr);
        // localStorage.removeItem('jsArr');
 
    };
}
getBrowserTime();
