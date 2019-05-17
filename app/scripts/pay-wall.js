
var isReqSuccess = false;
var i = 0;
var isPremium = false;
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
                  // updateLockClass();
                  isPremium = (dataObj.premium >= 1) ? true : false ;  
                  if(!isPremium && isEditorChoiceChannel()){
                      updateUnlockClass();
                  } else {
                      updateLockClass();
                  }
              }
            window.htmlClass = document.documentElement.className;
            window.htmlClass = window.htmlClass.replace(/\ is\-subscriber/g, '').replace(/\ is\-premium/g, '').replace(/\ is\-standard/g, '');
            var subscriptionType = 'noneSubscriber';
            if (dataObj.paywall === 0) {
                if (dataObj.premium === 1) {
                    window.htmlClass += ' is-subscriber is-premium';
                    subscriptionType = 'premium';
                } else {
                    window.htmlClass += ' is-subscriber is-standard';
                    subscriptionType = 'standard';
                }
            }
            var expireDate = '';
            if (dataObj.expire) {
              expireDate = dataObj.expire;
            }
            var ccode = dataObj.campaign_code || '';
            var duration = dataObj.latest_duration || '';
            var platform = 'WebSite';
            var pendingRenewal = '';
            var ua = navigator.userAgent || navigator.vendor || '';
            if (window.location.href.indexOf('webview=ftcapp')>=0) {
              if (/iphone|ipod|ipad/i.test(ua)) {
                platform = 'iOSApp';
                try {
                  pendingRenewal = paravalue(window.location.href, 'pendingRenewal');
                  //console.log ('p: ' + pendingRenewal);
                } catch (ignore) {}
              } else {
                platform = 'AndroidApp';
              }
            }
            
            // Test: Change expire date for testing
            expireDate = Math.round((new Date('2019-05-23 00:20:00')).getTime() / 1000);
            //duration = 'monthly';
            //ccode = '7SXXXXX';
            // platform = 'iOSApp';
            // pendingRenewal = 'On';
            var xhr = new XMLHttpRequest();
            xhr.open('get', '/m/corp/partial.html?include=promoboxone&type=' + subscriptionType + '&expire=' + expireDate + '&ccode=' + ccode + '&duration=' + duration + '&platform=' + platform + '&pendingRenewal=' + pendingRenewal);
            xhr.setRequestHeader('Content-Type', 'application/text');
            xhr.onload = function() {
              if (xhr.status === 200) {
                var data = xhr.responseText;
                if (data !== '') {
                  var promoboxContainer = document.getElementById('promo-box-container');
                  promoboxContainer.innerHTML = data;
                  startCountdown(promoboxContainer, expireDate);
                  sendTracking(promoboxContainer);
                }
              }
            };
            xhr.send(null);
            document.documentElement.className = window.htmlClass;
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

function startCountdown(promoboxContainer, expireDate) {
  if (expireDate > 0) {
    var hourEle = promoboxContainer.querySelector('.countdown-hour');
    var minuteEle = promoboxContainer.querySelector('.countdown-minute');
    var secondEle = promoboxContainer.querySelector('.countdown-second');
    if (hourEle && minuteEle && secondEle) {
      setInterval(function() {
        var nowTime = Math.round((new Date()).getTime() / 1000);
        var leftTime = expireDate - nowTime;
        var leftHours = Math.floor(leftTime / 3600);
        leftHours = (leftHours > 999) ? 999 : leftHours;
        leftHours = ('0'+leftHours).slice(-2);
        var leftMinutes = Math.floor(leftTime / 60) % 60;
        leftMinutes = ('0'+leftMinutes).slice(-2);
        var leftSeconds = leftTime % 60;
        leftSeconds = ('0'+leftSeconds).slice(-2);
        hourEle.innerHTML = leftHours;
        minuteEle.innerHTML = leftMinutes;
        secondEle.innerHTML = leftSeconds;
      }, 1000);
    }
  }
}

function sendTracking(promoboxContainer) {
  var boxEle = promoboxContainer.querySelector('.subscription-promo-box');
  if (boxEle) {
    var ccode = boxEle.getAttribute('data-promo-id');
    if (ccode && ccode !== '') {
      ga('send', 'event', 'PromoBox', 'Display', ccode, {'nonInteraction': 1});
    }
  }
}

function isEditorChoiceChannel(){
  var para = location.search.substring(1);
  var isEditorChoiceChannel = (para.indexOf('issue=EditorChoice')>=0) ? true : false;
  return isEditorChoiceChannel;
}

var userId1 = GetCookie('USER_ID') ;
if (userId1 !== null) {
  payWall(); 
}


// MARK: - 过滤出包含locked的item-headline数组
function getPayStory(className){
  var itemHeadline = document.querySelectorAll('.item-headline');
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
  // console.log('getPayHeadline len:'+getPayHeadline.length);
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

function showPaywallHint(){
  // var parameter = window.location.search.substr(1);
  var subscribeNowContainerId = document.getElementById('paywall-hint-container');
  if(subscribeNowContainerId){
      // if (parameter==='paywall=1'){
      //     subscribeNowContainerId.style.display = 'block';
      // }else{
      //     subscribeNowContainerId.style.display = 'none';
      // }

      var paywallOverlayShadow = document.getElementById('paywall-overlay-shadow');
      var paywallHintContainer = document.getElementById('paywall-hint-container');

      paywallOverlayShadow.onclick = function(){
          // paywallHintContainer.innerHTML = '';
          paywallHintContainer.style.display = 'none';
      };
  }

}
showPaywallHint();


function openHint() {
  var para = location.search.substring(1);
  var url = location.href;
  if (para.indexOf('issue=EditorChoice')>=0 || url.indexOf('speedread')>=0 ){
    var paywallHintContainer = document.getElementById('paywall-hint-container');
    var dataHints = document.querySelectorAll('[data-hint="dataHint"]');
    if(dataHints.length>0){
      for (var i = 0,len=dataHints.length; i < len; i++) {  
        dataHints[i].onclick = function(){   
          paywallHintContainer.style.display = 'block';
          ga('send','event','Web Privileges', 'Display', window.gSubscriptionEventLabel);
          ga('ec:addPromo', {               
            'id': window.gSubscriptionEventLabel,             
            'name': window.gSubscriptionEventLabel,          
            'creative': location.href,   
            'position': 'become a member'     
          });
        };
      }
    }
  }
}

openHint();

