(function(){
    // MARK: - In order to support old browsers, use javascript without the new fancy stuff. 
    var key = 'prev_h_v';
    var prevHomeVisitTime = GetCookie(key);
    var ec = 'Smart Home';
    if (prevHomeVisitTime) {
        var prevTime = parseInt(prevHomeVisitTime, 10);    
        var blocks = document.querySelectorAll('.block-container');
        var mainItems = [];
        for (var i=0; i<blocks.length; i++) {
            var list = blocks[i].querySelector('.list-container');
            if (!list) {continue;}
            var items = list.querySelectorAll('.item-container');
            if (items.length > 10) {
                mainItems = items;
                break;
            }
        }
        var oldestItemTime;
        var latestItemTime;
        for (var j=0; j<mainItems.length; j++) {
            var currentTimeString = mainItems[j].getAttribute('data-update');
            if (!currentTimeString || !/^[\d]{10,}$/.test(currentTimeString)) {continue;}
            var currentTime = parseInt(currentTimeString, 10);
            oldestItemTime = Math.min(currentTime, (oldestItemTime || currentTime));
            latestItemTime = Math.max(currentTime, (latestItemTime || currentTime));
        }
        if (prevTime < oldestItemTime) {
            // MARK: - Send just one option to avoid exceeding Google's quota
            gtag('event', 'Do Not Miss', {'event_label': 'home', 'event_category': ec, 'non_interaction': true});
        } else if (prevTime < latestItemTime) {
            gtag('event', 'Just In', {'event_label': 'home', 'event_category': ec, 'non_interaction': true});
        } else {
            gtag('event', 'No Update', {'event_label': 'home', 'event_category': ec, 'non_interaction': true});
        }
        // console.log(oldestItemTime);
        // console.log(latestItemTime);
    } else {
        // TODO: Onboarding for new visitor in the future. For now just log the event for further decision making. 
        gtag('event', 'First Time', {'event_label': 'home', 'event_category': ec, 'non_interaction': true});
    }
    var now = Math.round(new Date().getTime()/1000);
    SetCookie(key, now);
})();