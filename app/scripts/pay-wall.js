var isReqSuccess = false;
var i = 0;
var isPremium = false;

// var androidUserInfo = {
//   "displayName": "Faker",
//   "email": "faker@example.org",
//   "id": "0c726d53-2ec3-41e2-aa8c-5c4b0e23876a",
//   "isVerified": false,
//   "loginMethod": "email",
//   "membership": {
//     "autoRenew": false,
//     "cycle": "year",
//     "expireDate": "2020-08-22",
//     "id": "mmb_DYBOVDytt1PH",
//     "payMethod": "alipay",
//     "tier": "standard",
//     "vip": false
//   },
//   "userName": "Faker"
// };


// interface Account {
//   id: string; // FTC UUID
//   unionId: string | null; // Present if user logged in with Wechat, or linked to Wechat account.
//   stripeId: string | null; // Only if membership is purchased via Stripe.
//   userName: string | null;
//   email: string;
//   isVerified: boolean; // Whether email is verified.
//   avatarUrl: string | null; // FTC avatar. No used now.
//   loginMethod: "email" | "wechat"; // Will be `email` if use logged in with email + password, or wechat if user logged in with Wechat. It won't be changed during the lifecycle of being logged in, even if user linked FTC account with wechat account.
//   wechat: {
//       nickname: string | null; // Wechat nickname
//       avatarUrl: string | null; // Wechat avatar url.
//   };
//   membership: {
//       id: string | null;
//       tier: "standard" | "premium" | "vip" | null; // `vip` is not available until API finished migration.
//       cycle: "month" | "year" | null;
//       expireDate: string | null;
//       payMethod: "alipay" | "wechat" | "stripe" | "apple" | "b2b",
//       autoRenew: boolean; // Default false.
//       status: "active" | "canceled" | "incomplete" | "incomplate_expired" | "past_due" | "trialing" | "unpaid" | null;
//       vip: boolean; // Deprecated. Will be moved to `tier` as an enum value `vip`
//   }
// }


// paywallDataObj = {"paywall":0,"premium":1,"standard":1,"expire":1623394745,"source":"ftc"};

function payWall() {
  var dataObj = {paywall: 1, premium: 0, standard: 0};
  if (window.androidUserInfo) {
    if (window.androidUserInfo.membership) {
      var expireDate = new Date(window.androidUserInfo.membership.expireDate);
      var todayDate = new Date();
      if (expireDate >= todayDate) {
        dataObj = {paywall: 0, standard: 1};
        dataObj.premium = (window.androidUserInfo.membership.tier === 'premium') ? 1 : 0;
      }
      dataObj.expire = parseInt(expireDate.getTime()/1000, 10);
      dataObj.source = (window.androidUserInfo.membership.vip) ? 'ftc' : '';
    }
    // console.log(dataObj);
    handleSubscriptionInfo(dataObj);
  } else if (!isReqSuccess && i<3) {
    var userId1 = GetCookie('USER_ID') ;
    if (userId1 === null) {return;}
    var xhrpw = new XMLHttpRequest();
    xhrpw.open('get', '/index.php/jsapi/paywall');
    xhrpw.setRequestHeader('Content-Type', 'application/text');
    xhrpw.onload = function() {
      if (xhrpw.status === 200) {
        isReqSuccess = true;
        var data = xhrpw.responseText;
        dataObj = JSON.parse(data); 
        handleSubscriptionInfo(dataObj);
      } else {
        isReqSuccess = false;
        i += 1;
        setTimeout(function(){payWall();}, 500); 
      }
    };
    xhrpw.send(null);
  }
}

function handleSubscriptionInfo(dataObj) {
  if (dataObj.paywall >= 1) {
    updateUnlockClass();
  } else {
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
  SetCookie('expire', expireDate);
  var ccode = dataObj.campaign_code || '';
  var duration = dataObj.latest_duration || '';
  var platform = 'WebSite';
  var pendingRenewal = '';
  var ua = navigator.userAgent || navigator.vendor || '';
  if (window.location.href.indexOf('webview=ftcapp')>=0 || typeof androidUserInfo !== 'undefined') {
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
  //expireDate = Math.round((new Date('2019-06-01 00:20:00')).getTime() / 1000);
  //duration = 'monthly';
  //ccode = '7SXXXXX';
  // platform = 'iOSApp';
  // pendingRenewal = 'On';
  var xhr = new XMLHttpRequest();
  var url = '/m/corp/partial.html?include=promoboxone&type=' + subscriptionType + '&expire=' + expireDate + '&ccode=' + ccode + '&duration=' + duration + '&platform=' + platform + '&pendingRenewal=' + pendingRenewal;
  xhr.open('get', url);
  xhr.setRequestHeader('Content-Type', 'application/text');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = xhr.responseText;
      if (data !== '') {
        var promoboxContainer = document.getElementById('promo-box-container');
        if (promoboxContainer) {
          promoboxContainer.innerHTML = data;
          startCountdown(promoboxContainer, expireDate);
          sendTracking(promoboxContainer);
        }
      }
    }
  };
  xhr.send(null);
  document.documentElement.className = window.htmlClass;
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
      gtag('event', 'Display', {'event_label': ccode, 'event_category': 'PromoBox', 'non_interaction': true});
    }
  }
}

function isEditorChoiceChannel(){
  var para = location.search.substring(1);
  var isEditorChoiceChannel = (para.indexOf('issue=EditorChoice')>=0) ? true : false;
  return isEditorChoiceChannel;
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
          gtag('event', 'view_promotion', {
            promotions: [
              {
                id: window.gSubscriptionEventLabel,
                name: window.gSubscriptionEventLabel,
                creative_name: location.href,
                creative_slot: 'become a member'
              }
            ]
          });
          gtag('event', 'Display', {'event_label': window.gSubscriptionEventLabel, 'event_category': 'Web Privileges'});
        };
      }
    }
  }
}

payWall();
showPaywallHint();
openHint();