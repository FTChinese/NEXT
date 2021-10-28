(function(){

    var noUpdateHour = 2;
    
    var actions = {
        doNotMiss: 'Do Not Miss',
        justIn: 'Just In',
        noUpdateForLong: 'No Update For More than ' + noUpdateHour + ' Hours',
        rightOnTime: 'Right On time',
        firstTime: 'First Time'
    };

    function doNotMiss(prevHomeVisitTime, mainItemsContainer) {
        console.log(prevHomeVisitTime, mainItemsContainer);
    }

    function justIn(prevHomeVisitTime, mainItemsContainer) {
        function run(value) {
            console.log('Experiment value: ' + value);
            if (value !== '1') {
                return;
            }
            var children = mainItemsContainer.children;
            var childrenCount = children.length;
            var newItems = [];
            var oldItems = [];
            // MARK: - Save the class names in an array of string, so that it won't be affected by other changes to the dom elements
            var classNames = [];
            for (var i=0; i<childrenCount; i++) {
                var child = children[i];
                if (child.className.indexOf('item-container') === -1) {continue;}
                var updateTime = parseInt(child.getAttribute('data-update'), 10);
                if (!updateTime || updateTime < prevHomeVisitTime) {
                    oldItems.push(child);
                } else {
                    newItems.push(child);
                }
                classNames.push(child.className);
            }
            var reorderedItems = newItems.concat(oldItems);
            var itemIndex = 0;
            var hasReordered = false;
            for (var j=0; j<childrenCount; j++) {
                var oldChild = children[j];
                var newChild = reorderedItems[itemIndex];
                if (oldChild.className.indexOf('item-container') === -1) {continue;}
                var currentHeadline = oldChild.querySelector('.item-headline-link').innerHTML;
                var newHeadline = newChild.querySelector('.item-headline-link').innerHTML;
                if (currentHeadline !== newHeadline) {
                    newChild.className = classNames[itemIndex];
                    var figure = newChild.querySelector('figure');
                    if (figure) {
                        figure.className = 'loading';
                        figure.innerHTML = '';
                    }
                    oldChild.outerHTML = newChild.outerHTML;
                    hasReordered = true;
                }
                itemIndex += 1;
            }
            // MARK: - Wait some time so that runLoadImages functions are loaded.
            if (hasReordered === false) {return;} 
            setTimeout(function(){
                try {
                    runLoadImages();
                } catch(ignore) {}
            }, 1000);
        }
        gtag('event', 'optimize.callback', {
            name: '5GXPNMPxSw2Fry7ngDqB4w',
            callback: run
        });
    }

    function implementAction(ea, prevHomeVisitTime, mainItemsContainer) {
        // MARK: - For now, we only take action for the first two types of situations. In the future, we might figure out what to do for the other two situations. Onboarding for new visitor in the future. For now just log the event for further decision making. 
        gtag('event', ea, {'event_label': 'home', 'event_category': 'Smart Home', 'non_interaction': true});
        if (ea === actions.doNotMiss) {
            doNotMiss(prevHomeVisitTime, mainItemsContainer);
        } else if (ea === actions.justIn) {
            justIn(prevHomeVisitTime, mainItemsContainer);
        }
    }

    function smartHomePage() {
        var now = Math.round(new Date().getTime()/1000);
        // MARK: - In order to support old browsers, use javascript without the new fancy stuff. 
        var key = 'prev_h_v';
        var prevHomeVisitTime = GetCookie(key);


        // TEST: - Change prevHomeVisitTime to test
        // prevHomeVisitTime = '1635298210';

        var ea;
        var mainItems = [];
        var mainItemsContainer;
        if (prevHomeVisitTime) {
            var prevTime = parseInt(prevHomeVisitTime, 10);    
            var blocks = document.querySelectorAll('.block-container');
            for (var i=0; i<blocks.length; i++) {
                var list = blocks[i].querySelector('.list-container');
                if (!list) {continue;}
                var items = list.querySelectorAll('.item-container');
                if (items.length > 10) {
                    mainItems = items;
                    mainItemsContainer = list.querySelector('.items');
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
            } else if (now > latestItemTime && now - latestItemTime < noUpdateHour * 3600) {
                ea = actions.rightOnTime;
            } else if (now > latestItemTime) {
                ea = actions.noUpdateForLong;
            }
        } else {
            ea = actions.firstTime;
        }
        implementAction(ea, prevHomeVisitTime, mainItemsContainer);
        SetCookie(key, now);
    }

    smartHomePage();

})();