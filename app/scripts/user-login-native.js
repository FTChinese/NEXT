// FIXME: There's an exact same function in the NEXT project. It needs to be handled. 
function passLoginToNative() {
    var message = {};
    var uniqueId = GetCookie('uniqueVisitorId') || guid();
    var userNameForLogin = GetCookie('USER_NAME') || '';
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
}

// MARK: This will throw error if not in iOS WKWebview
try {
    passLoginToNative();
} catch(ignore) {

}
