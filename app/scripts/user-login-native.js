// FIXME: There's an exact same function in the NEXT project. It needs to be handled. 
function passLoginToNative() {
    // MARK: Use info from cookie for speed
    var message = {};
    var uniqueId = GetCookie('uniqueVisitorId') || guid();
    var userNameForLogin = GetCookie('USER_NAME') || GetCookie('USER_NAME_FT') || '';
    var userIdForLoginUser = GetCookie('USER_ID') || '';
    message = {
        'username': userNameForLogin,
        'userId': userIdForLoginUser,
        'uniqueVisitorId': uniqueId
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
    // MARK: Valid the info with a network request
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/index.php/jsapi/paywall');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var userInfo = JSON.parse(xhr.responseText);
            if (userInfo.paywall === 0) {
                if (userInfo.premium === 1) {
                    message.paywall = 'premium';
                } else {
                    htmlClass += ' is-subscriber is-standard';
                    message.paywall = 'standard';
                }
                message.paywallExpire = userInfo.paywallExpire || '';
            } else {
                message.paywall = '';
                message.paywallExpire = '';
            }
            try {
               webkit.messageHandlers.user.postMessage(message);
            } catch (ignore) {
                
            }
        }
    };
    xhr.send();
}

// MARK: This will throw error if not in iOS WKWebview
try {
    passLoginToNative();
} catch(ignore) {

}
