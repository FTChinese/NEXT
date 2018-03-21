
var itemHeadline = document.querySelectorAll('.item-headline');
function payWall(){  
    var xhrpw = new XMLHttpRequest();
    xhrpw.open('get', '/index.php/jsapi/paywall');
    xhrpw.setRequestHeader('Content-Type', 'application/text');
    xhrpw.onload = function() {
        if (xhrpw.status === 200) {
            var data = xhrpw.responseText;
            var dataObj = JSON.parse(data); 
            if (dataObj.paywall === 1) {
                // console.log('get paywall:'+data);
                updateLockClass();
            }
        } else {
            // updateLockClass();
            console.log('fail to get pw');
        }
    };
    xhrpw.send(null);
}

var userId1 = GetCookie('USER_ID') || GetCookie('uniqueVisitorId');
if (userId1 !== null) {
    payWall();   
    var interval = setInterval(function(){
      payWall();
    },3000);
    setTimeout(function( ) {
       clearInterval(interval); 
    }, 15000); 
}


var getPayHeadline = [];
// 过滤出包含locked的item-headline数组
function getPayStory(){
  // 循环itemHeadline长度数量
  for (var i = 0; i < itemHeadline.length; i++) {
        var childNodes = itemHeadline[i].children;
        // 循环childNodes长度数量
        for (var j = 0; j < childNodes.length; j++) {
          if (hasClass(childNodes[j],'locked')){
            getPayHeadline.push(childNodes[j]);
          }
        }
  }
}
getPayStory();

function updateLockClass(){
    if (getPayHeadline.length>0){
      for (var k = 0; k < getPayHeadline.length; k++) {
        removeClass(getPayHeadline[k], 'locked');
        addClass(getPayHeadline[k], 'unlocked');
      }
    }
}

function hasClass(ele, cls) {
  cls = cls || '';
  if (cls.replace(/\s/g, '').length === 0) {
    return false; 
  }else{
    return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
  }

}
 
function addClass(ele, cls) {
  if (!hasClass(ele, cls)) {
    ele.className = ele.className === '' ? cls : ele.className + ' ' + cls;
  }
}
 
function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    var newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
    while (newClass.indexOf(' ' + cls + ' ') >= 0) {
      newClass = newClass.replace(' ' + cls + ' ', ' ');
    }
    ele.className = newClass.replace(/^\s+|\s+$/g, '');
  }
}

// 过滤出包含a的子节点，然后用过滤出的节点增加class
// function getHeadlineA(ele,clsName){
//     var childNodes = ele.children;   //HTMLCollection
//     for (let i = 0; i < childNodes.length; i++) {
//       if (childNodes[i].tagName.toLowerCase()==='a'){
//         addClass(childNodes[i], clsName);
//       }
//     } 
// }


/**
 * 更新会员中心，订阅信息
 */
function vipCenter(){
  var vipType = 'common';
  var vipTypeId = document.getElementById('vip-type');
  var warmPrompt = document.getElementById('warm-prompt');
  if(vipType==='common'){
    vipTypeId.innerHTML = '门外会员';
    warmPrompt.innerHTML = '您还不是会员，请<a href="http://a.app.qq.com/o/simple.jsp?pkgname=com.ft" target="_blank" style="background:#d7c29e" id="open-app">立即订阅</a>';
  }
}
vipCenter();