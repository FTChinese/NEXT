(function(){

    function payWall() {
        if (typeof window.androidUserInfo !== 'object') {return;}
        var dataObj = {paywall: 1, premium: 0, standard: 0};
        var expireDate = new Date(window.androidUserInfo.membership.expireDate);
        var todayDate = new Date();
        if (window.androidUserInfo.membership.vip) {
            // MARK: The Android app backend returns wrong expire date for VIP users, override it here. 
            dataObj = {paywall: 0, standard: 1, premium: 1};
            var year = todayDate.getFullYear();
            var month = todayDate.getMonth();
            var day = todayDate.getDate();
            expireDate = new Date(year + 1, month, day);
        } else if (expireDate >= todayDate) {
            dataObj = {paywall: 0, standard: 1};
            dataObj.premium = (window.androidUserInfo.membership.tier === 'premium') ? 1 : 0;
        }
        dataObj.expire = parseInt(expireDate.getTime()/1000, 10);
        dataObj.source = (window.androidUserInfo.membership.vip) ? 'ftc' : '';
        handleSubscriptionInfo(dataObj);
    }

    function handleSubscriptionInfo(dataObj) {
        window.htmlClass = document.documentElement.className.replace('{night-class}', '');
        window.htmlClass = window.htmlClass.replace(/\ is\-subscriber/g, '').replace(/\ is\-premium/g, '').replace(/\ is\-standard/g, '');
        var subscriptionType = 'noneSubscriber';
        if (dataObj.paywall === 0) {
            subscriptionType = (dataObj.premium === 1) ? 'premium' : 'standard';
            window.htmlClass += ' is-subscriber is-' + subscriptionType;
        }
        var expireDate = dataObj.expire || '';
        SetCookie('expire', expireDate);
        var ccode = dataObj.campaign_code || '';
        var duration = dataObj.latest_duration || '';
        var platform = 'AndroidApp';
        var pendingRenewal = '';
        var xhr = new XMLHttpRequest();
        var url = '/m/corp/partial.html?include=promoboxone&type=' + subscriptionType + '&expire=' + expireDate + '&ccode=' + ccode + '&duration=' + duration + '&platform=' + platform + '&pendingRenewal=' + pendingRenewal;
        xhr.open('get', url);
        xhr.setRequestHeader('Content-Type', 'application/text');
        xhr.onload = function() {
            if (xhr.status !== 200) {return;}
            var data = xhr.responseText;
            if (data === '') {return;}
            var promoboxContainer = document.getElementById('promo-box-container');
            if (!promoboxContainer) {return;}
            promoboxContainer.innerHTML = data;
            window.startCountdown(promoboxContainer, expireDate);
            window.sendTracking(promoboxContainer);
        };
        xhr.send(null);
        document.documentElement.className = window.htmlClass;
    }

    var checked = false;

    function checkAndroidUser() {
        setTimeout (function(){
            var debugEle = document.querySelector('#android-text-debug');
            if (debugEle) {
                document.querySelector('#android-text-debug').innerHTML = 'k: ' + window.androidUserInfo;
            }
        }, 2000);
        if (typeof androidUserInfo === 'undefined' && checked === false) {
            setTimeout(function() {checkAndroidUser();}, 2000);
            checked = true;
            return;
        }
        if (typeof androidUserInfo === 'undefined') {
            var dataObj = {paywall: 1};
            handleSubscriptionInfo(dataObj);
        } else {
            payWall();
        }
    }
    checkAndroidUser();

})();