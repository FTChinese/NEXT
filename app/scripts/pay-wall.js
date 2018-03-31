
var itemHeadline = document.querySelectorAll('.item-headline');
// function payWall(){  
//     var xhrpw = new XMLHttpRequest();
//     xhrpw.open('get', '/index.php/jsapi/paywall');
//     xhrpw.setRequestHeader('Content-Type', 'application/text');
//     xhrpw.onload = function() {
//         if (xhrpw.status === 200) {
//            isReqSuccess = true;
//             var data = xhrpw.responseText;
//             var dataObj = JSON.parse(data); 
//             if (dataObj.paywall >= 1) {      
//                 updateUnlockClass();
//             }else{
//                 updateLockClass();
//                 // console.log('open lock class');
//             }
//         } else {
//             console.log('fail to request');
//         }
//     };
//     xhrpw.send(null);
// }

// var userId1 = GetCookie('USER_ID') ;
// if (userId1 !== null) {
//     payWall(); 
//     var interval = setInterval(function(){
//         payWall();
//     },5000);
//     setTimeout(function( ) {
//       clearInterval(interval); 
//     }, 10000);  
// }

var isReqSuccess = false;
var i = 0;
function payWall(){  
if(!isReqSuccess && i<3){
      var xhrpw = new XMLHttpRequest();
      xhrpw.open('get', '/index.php/jsapi/paywall');
      xhrpw.setRequestHeader('Content-Type', 'application/text');
      xhrpw.onload = function() {
          if (xhrpw.status === 200) {
            isReqSuccess = true;
              var data = xhrpw.responseText;
              var dataObj = JSON.parse(data); 
              if (dataObj.paywall >= 1) {      
                  updateUnlockClass();
              }else{
                  updateLockClass();
              }
          } else {
              isReqSuccess = false;
              i++;
              setTimeout(function() {
                  payWall(); 
              }, 500); 
              console.log('fail to request:'+i);
          }
      };
      xhrpw.send(null);
    }
}

var userId1 = GetCookie('USER_ID') ;
if (userId1 !== null) {
  payWall(); 
}


// 过滤出包含locked的item-headline数组
function getPayStory(className){
  var getPayHeadline = [];
  // 循环itemHeadline长度数量
  for (var i = 0; i < itemHeadline.length; i++) {
        var childNodes = itemHeadline[i].children;
        // 循环childNodes长度数量
        for (var j = 0; j < childNodes.length; j++) {
          if (hasClass(childNodes[j],className)){
            getPayHeadline.push(childNodes[j]);
          }
        }
  }
  return getPayHeadline;
}




function updateLockClass(){
  var getPayHeadline = getPayStory('locked');
  if (getPayHeadline.length>0){
    for (var k = 0; k < getPayHeadline.length; k++) {
      removeClass(getPayHeadline[k], 'locked');
      addClass(getPayHeadline[k], 'unlocked');
    }
  }
}
function updateUnlockClass(){
    var getPayHeadline = getPayStory('unlocked');
    if (getPayHeadline.length>0){
      for (var k = 0; k < getPayHeadline.length; k++) {
        removeClass(getPayHeadline[k], 'unlocked');
        addClass(getPayHeadline[k], 'locked');
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


