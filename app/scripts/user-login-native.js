function passLoginToNative() {
    // MARK: Use info from cookie for speed
    var message = {};
    var uniqueId = GetCookie('uniqueVisitorId') || guid();
    var userNameForLogin = GetCookie('USER_NAME') || GetCookie('USER_NAME_FT') || '';
    var userIdForLoginUser = GetCookie('USER_ID') || '';
    var ccode = GetCookie('ccode') || '';
    message = {
        'username': userNameForLogin,
        'userId': userIdForLoginUser,
        'uniqueVisitorId': uniqueId,
        'ccode': ccode
    };
    // MARK: Get subscription: standard/premium
    var paywall = GetCookie('paywall') || '';
    var paywallExpire = GetCookie('paywall_expire') || '';
    if (paywall !== '') {
        message.paywall = paywall;
    }
    if (paywallExpire !== '') {
        message.paywallExpire = paywallExpire;
    }
    try {
       webkit.messageHandlers.user.postMessage(message);
    } catch (ignore) {
    }
    // MARK: If the user is not logged in, no need to go on checking API
    if (userIdForLoginUser === '') {
        return;
    }
    // MARK: Valid the info with a network request
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/index.php/jsapi/paywall');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var userInfo = JSON.parse(xhr.responseText);
            window.htmlClass = document.documentElement.className;
            window.htmlClass = window.htmlClass.replace(/\ is\-subscriber/g, '').replace(/\ is\-premium/g, '').replace(/\ is\-standard/g, '');
            if (userInfo.paywall === 0) {
                if (userInfo.premium === 1) {
                    message.paywall = 'premium';
                    window.htmlClass += ' is-subscriber is-premium';
                } else {
                    message.paywall = 'standard';
                    window.htmlClass += ' is-subscriber is-standard';
                }
                message.paywallExpire = userInfo.expire || '';
                document.documentElement.className = window.htmlClass;
            } else {
                message.paywall = '';
                message.paywallExpire = '';
            }
            message.ccode = userInfo.campaign_code || '';
            message.duration = userInfo.latest_duration || '';
            try {
               webkit.messageHandlers.user.postMessage(message);
            } catch (ignore) {
                
            }
            //var mainDomain = document.domain.replace(/^[^.]+/g, '');
            console.log ('save User expire: ' + userInfo.expire); 
            SetCookie('paywall_expire',userInfo.expire,86400*100,'/');
            SetCookie('paywall',message.paywall,86400*100,'/');
            console.log ('get User expire: ' + GetCookie('paywall_expire'));
        }
    };
    xhr.send();
}

// MARK: This will throw error if not in iOS WKWebview
try {
    passLoginToNative();
} catch(ignore) {

}
