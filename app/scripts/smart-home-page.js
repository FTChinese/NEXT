(function(){

    var actions = {
        doNotMiss: 'Do Not Miss',
        justIn: 'Just In',
        noUpdate: 'No Update',
        firstTime: 'First Time'
    };

    function doNotMiss() {
        console.log('The user probably has missed some thing since last vist, show them! ');
    }

    function justIn() {
        console.log('There are new items that the user might not have already seen, reorder the home page! ');
    }

    function implementAction(ea, value) {
        // MARK: - For now, we only take action for the first two types of situations. In the future, we might figure out what to do for the other two situations. Onboarding for new visitor in the future. For now just log the event for further decision making. 
        gtag('event', ea, {'event_label': 'home', 'event_category': 'Smart Home', 'non_interaction': true});
        if (value !== 1) {return;}
        if (ea === actions.doNotMiss) {
            doNotMiss();
        } else if (ea === actions.justIn) {
            justIn();
        }
    }

    function implementExperimentA(value) {
        console.log('implementExperimentA: ' + value);
        // MARK: - In order to support old browsers, use javascript without the new fancy stuff. 
        var key = 'prev_h_v';
        var prevHomeVisitTime = GetCookie(key);
        var ea;
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
                ea = actions.doNotMiss;
            } else if (prevTime < latestItemTime) {
                ea = actions.justIn;
            } else {
                ea = actions.noUpdate;
            }
        } else {
            ea = actions.firstTime;
        }
        implementAction(ea, value);
        var now = Math.round(new Date().getTime()/1000);
        SetCookie(key, now);
    }

    // gtag('event', 'optimize.callback', {
    //     name: 'pQMbN2geSHaBo5XBkC_uJA',
    //     callback: implementExperimentA
    // });
    // MARK: - Before the experiment is on, track data only
    implementExperimentA('0');

})();