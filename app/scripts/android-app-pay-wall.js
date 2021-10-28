// MARK: - Test promo box guide: Open the home page of FTC, set the global variable androidUserInfo, then run this whole code on console. 
// https://dkmoez7aydo8v.cloudfront.net/?maxB=1&backupfile=localbackup&showIAP=yes&pagetype=home&001&webview=ftcapp&utm_source=marketing&utm_medium=androidmarket&utm_campaign=an_huawei&android=77

/// http://www7.ftchinese.com/?maxB=1&backupfile=localbackup&showIAP=yes&pagetype=home&001&webview=ftcapp&utm_source=marketing&utm_medium=androidmarket&utm_campaign=an_huawei&android=77

// window.androidUserInfo = {"avatarUrl":null,"displayName":"13501132161","email":"13501132161@163.com","id":"5c65e325-507d-4820-b80f-2e455c21535d","isFtcOnly":true,"isLinked":false,"isMember":true,"isTest":false,"isVerified":false,"isWxOnly":false,"loginMethod":"email","membership":{"addOns":[],"appleSubsId":null,"autoRenew":false,"autoRenewMoment":null,"autoRenewOffExpired":false,"b2bLicenceId":null,"canCancelStripe":false,"cycle":"year","expireDate":"2021-06-02","expired":false,"hasAddOn":false,"hasPremiumAddOn":false,"hasStandardAddOn":false,"isInvalidStripe":false,"isStripe":false,"normalizedPayMethod":"ALIPAY","offerKinds":["Promotion","Retention"],"payMethod":null,"premiumAddOn":0,"shouldUseAddOn":false,"standardAddOn":0,"status":null,"stripeSubsId":null,"tier":"standard","tierStringRes":2131952263,"vip":false},"mobile":null,"stripeId":"cus_IxyknFwUQQ2xxy","unionId":null,"userName":"13501132161","wechat":{"avatarUrl":null,"isEmpty":true,"nickname":null}}
(function(){
    function payWall() {
        var dataObj = {paywall: 1, premium: 0, standard: 0};
        if (typeof window.androidUserInfo !== 'object') {
            dataObj = {paywall:1, premium:0, standard:0};
            handleSubscriptionInfo(dataObj);
            return;
        }
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
        if (window.androidUserInfo.membership.cycle) {
            dataObj.latest_duration = (window.androidUserInfo.membership.cycle === 'month') ? 'monthly' : 'yearly';
        }
        handleSubscriptionInfo(dataObj);
    }

    function handleSubscriptionInfo(dataObj) {
        window.htmlClass = document.documentElement.className.replace('{night-class}', '');
        window.htmlClass = window.htmlClass.replace(/\ is\-subscriber/g, '').replace(/\ is\-premium/g, '').replace(/\ is\-standard/g, '');
        var subscriptionType = 'noneSubscriber';
        var noneSubscriberStatus;
        if (dataObj.paywall === 0) {
            subscriptionType = (dataObj.premium === 1) ? 'premium' : 'standard';
            window.htmlClass += ' is-subscriber is-' + subscriptionType;
        } else {
            // MARK: - Get none-subscriber status: new and churned
            noneSubscriberStatus = dataObj.expire ? 'churned' : 'new';
        }
        var expireDate = dataObj.expire || '';
        SetCookie('expire', expireDate);
        var ccode = dataObj.campaign_code || '';
        var duration = dataObj.latest_duration || '';
        var platform = 'AndroidApp';
        var pendingRenewal = '';
        var xhr = new XMLHttpRequest();
        var noneSubscriberParameter = (typeof noneSubscriberStatus === 'string') ? '&noneSubscriberStatus=' + noneSubscriberStatus : ''; 
        var url = '/m/corp/partial.html?include=promoboxone&type=' + subscriptionType + '&expire=' + expireDate + '&ccode=' + ccode + '&duration=' + duration + '&platform=' + platform + '&pendingRenewal=' + pendingRenewal + noneSubscriberParameter;
        // console.log(url);
        xhr.open('get', url);
        xhr.setRequestHeader('Content-Type', 'application/text');
        xhr.onload = function() {
            if (xhr.status !== 200) {return;}
            var data = xhr.responseText;
            if (data === '') {return;}
            console.log(data);
            var promoboxContainer = document.getElementById('promo-box-container');
            if (!promoboxContainer) {return;}
            console.log('promo box found');
            promoboxContainer.innerHTML = data;
            if (typeof window.startCountdown === 'function') {
                window.startCountdown(promoboxContainer, expireDate);
            }
            if (typeof window.sendTracking === 'function') {
                window.sendTracking(promoboxContainer);
            }
        };
        xhr.send(null);
        document.documentElement.className = window.htmlClass;
    }

    var checked = false;

    function checkAndroidUser() {
        setTimeout (function(){
            // MARK: - Don't Delete, very useful tool
            // var debugEle = document.querySelector('#android-text-debug');
            // if (debugEle) {
            //     var infoString = (window.androidUserInfo && typeof window.androidUserInfo === 'object') ? JSON.stringify(window.androidUserInfo) : 'not object';
            //     document.querySelector('#android-text-debug').innerHTML = 'k: ' + infoString;
            // }
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