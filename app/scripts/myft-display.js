// display followed items an hide unfollowed items


function filterMyFTItems() {
    var key = 'my-ft-follow';
    var allItems = document.querySelectorAll('.list-my-ft .item-container');
    function udpateDescription (text) {
        var itemDescription = document.querySelector('.list-my-ft .items .no-image .item-lead');
        if (itemDescription) {
            itemDescription.innerHTML = text;
            for (var m=0; m<allItems.length; m++) {
                allItems[m].style.display = 'block';
                var itemTop = allItems[m].previousElementSibling;
                if (itemTop && m>0) {
                    itemTop.style.display = 'block';
                }
            }
        }
    }
    if (!localStorage) {
        alert ('亲爱的读者，您的浏览器不支持localStorage，请您更换现代浏览器来使用关注的功能。');
        return;
    }
    var savedFollowList = localStorage.getItem(key);
    var savedFollowListJSON = JSON.parse(savedFollowList) || null;
    var isFollowListEmpty = false;
    if (savedFollowListJSON === null) {
        isFollowListEmpty = true;
    } else {
        var followKeywordCount = 0;
        for (var t in savedFollowListJSON) {
          if (savedFollowListJSON.hasOwnProperty(t)) {
            if (typeof savedFollowListJSON[t] === 'object' && savedFollowListJSON[t].length > 0) {
                followKeywordCount += savedFollowListJSON[t].length;
            }
          }
        }
        if (followKeywordCount <= 0) {
            isFollowListEmpty = true;
        }
    }
    if (isFollowListEmpty) {
        udpateDescription ('亲爱的读者，您还没有关注任何话题。请您浏览下面的内容标题，选择您感兴趣的话题。');
        return;
    }
    var l = 0;
    for (var i=0; i<allItems.length; i++) {
        var item = allItems[i];
        var itemKeywords = item.getAttribute('data-keywords') || '';
        var itemAuthors = item.getAttribute('data-author') || '';
        itemKeywords += ',' + itemAuthors; 
        itemKeywords = itemKeywords.replace(/,+/g, ',').replace(/,$/, '');
        var itemKeywordsArray = itemKeywords.split(',');
        for (var itemType in savedFollowListJSON) {
          if (savedFollowListJSON.hasOwnProperty(itemType)) {
            var checkItemFor = savedFollowListJSON[itemType];
            for (var j=0; j<checkItemFor.length; j++) {
                for (var k=0; k<itemKeywordsArray.length; k++) {
                    if (checkItemFor[j] === itemKeywordsArray[k]) {
                        var itemButton = item.querySelector('.myft-follow');
                        if (itemButton) {
                            itemButton.className = 'myft-follow tick';
                            itemButton.setAttribute('data-tag', checkItemFor[j]);
                            itemButton.setAttribute('data-type', itemType);
                            itemButton.innerHTML = '已关注';
                        }
                        var itemTagLink = item.querySelector('.item-tag a');
                        if (itemTagLink) {
                            itemTagLink.innerHTML = checkItemFor[j];
                            itemTagLink.href = '/' + itemType + '/' + checkItemFor[j];
                        }
                        var itemTop = item.previousElementSibling;
                        if (itemTop) {
                            if (itemTop.className === 'XLT LT ST MT PT' && l>0) {
                                itemTop.style.display = 'block';
                            }
                        }
                        item.style.display = 'block';
                        l += 1;
                        break;
                    }
                }
            }
          }
        }
    }
    if (l === 0) {
        udpateDescription ('亲爱的读者，您关注的话题近期没有最新。请您浏览下面的内容标题，选择更多您感兴趣的话题。');
    }
}

filterMyFTItems();