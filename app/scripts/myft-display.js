// MARK: display followed items by hiding unfollowed items
function normalizeMyFTDisplayValue(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
}

function addMyFTDisplayFollow(dict, type, value) {
    type = normalizeMyFTDisplayValue(type);
    value = normalizeMyFTDisplayValue(value);
    if (!type || !value) {
        return;
    }
    if (!Array.isArray(dict[type])) {
        dict[type] = [];
    }
    if (dict[type].indexOf(value) < 0) {
        dict[type].push(value);
    }
}

function addPreferenceInterestToDisplayFollows(dict, interest) {
    if (!interest || typeof interest !== 'object') {
        return;
    }
    var key = normalizeMyFTDisplayValue(interest.key);
    var display = normalizeMyFTDisplayValue(interest.display) || key;
    var type = normalizeMyFTDisplayValue(interest.type).toLowerCase() || 'tag';
    if (!key && !display) {
        return;
    }

    if (type === 'byline') {
        addMyFTDisplayFollow(dict, 'author', display || key);
        addMyFTDisplayFollow(dict, 'authors', display || key);
        addMyFTDisplayFollow(dict, 'byline', key || display);
        return;
    }

    if (type === 'regions') {
        addMyFTDisplayFollow(dict, 'area', key || display);
        addMyFTDisplayFollow(dict, 'area', display || key);
        addMyFTDisplayFollow(dict, 'regions', key || display);
        addMyFTDisplayFollow(dict, 'tag', display || key);
        return;
    }

    if (type === 'topics') {
        addMyFTDisplayFollow(dict, 'topic', key || display);
        addMyFTDisplayFollow(dict, 'industry', key || display);
        addMyFTDisplayFollow(dict, 'topics', key || display);
        addMyFTDisplayFollow(dict, 'tag', display || key);
        return;
    }

    if (type === 'organisations') {
        addMyFTDisplayFollow(dict, 'organisation', key || display);
        addMyFTDisplayFollow(dict, 'organisations', key || display);
        addMyFTDisplayFollow(dict, 'tag', display || key);
        return;
    }

    addMyFTDisplayFollow(dict, type, key || display);
    addMyFTDisplayFollow(dict, 'tag', display || key);
}

function getLocalPreferenceFollowsForDisplay() {
    var dict = {};
    if (!localStorage) {
        return dict;
    }
    try {
        var preference = JSON.parse(localStorage.getItem('preference') || '{}') || {};
        var interests = [];
        if (Array.isArray(preference['My Interests'])) {
            interests = interests.concat(preference['My Interests']);
        }
        if (Array.isArray(preference['My Custom Interests'])) {
            interests = interests.concat(preference['My Custom Interests']);
        }
        for (var i=0; i<interests.length; i++) {
            addPreferenceInterestToDisplayFollows(dict, interests[i]);
        }
    } catch (ignore) {}
    return dict;
}

async function getPreferenceFollowsForDisplay() {
    var localFollows = getLocalPreferenceFollowsForDisplay();
    if (typeof fetch !== 'function') {
        return localFollows;
    }
    try {
        var response = await fetch('/get_myft_follows', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'}
        });
        if (!response.ok) {
            return localFollows;
        }
        var serverFollows = await response.json();
        if (serverFollows && typeof serverFollows === 'object') {
            return serverFollows;
        }
    } catch (ignore) {}
    return localFollows;
}

async function filterMyFTItems() {
    var dict = {
        'usa': '美国',
        'uk': '英国',
        'asiapacific': '亚太',
        'europe': '欧洲',
        'americas': '美洲',
        'africa': '非洲',
        'middleeast': '中东',
        'Hong Kong': '香港',
        'Taiwan': '台湾',
        'Xinjiang': '新疆',
        'Beijing': '北京',
        'Shanghai': '上海',
        'Shenzhen': '深圳',
        'Guangzhou': '广州',
        'Chongqing': '重庆',
        'Chengdu': '成都',
        'Tianjin': '天津',
        'Wuhan': '武汉',
        'Japan': '日本',
        'South Korea': '韩国',
        'North Korea': '朝鲜',
        'Germany': '德国',
        'Vietnam': '越南',
        'France': '法国',
        'India': '印度',
        'Russia': '俄罗斯',
        'Brazil': '巴西',
        'Canada': '加拿大',
        'Singapore': '新加坡',
        'Australia': '澳大利亚',
        'china': '中国',
        'Ukraine': '乌克兰',
        'politics': '政治',
        'society': '社会',
        'artstory': '艺术',
        'travle': '旅行',
        'book': '书评',
        'business': '商业',
        'culture': '社会与文化',
        'economy': '经济',
        'environment': '环境',
        'trade': '贸易',
        'markets': '金融市场',
        'management': '管理',
        'career': '职场',
        'lifestyle': '生活时尚',
        'spend': '消费经',
        'education': '教育',
        'businessedu': '商业教育',
        'stock': '股市',
        'forex': '外汇',
        'commodity': '大宗商品',
        'bond': '债市',
        'leadership': '领导力',
        'people': '人物',
        'finance': '金融',
        'technology': '科技',
        'auto': '汽车',
        'property': '地产',
        'energy': '能源',
        'industrials': '工业和采矿',
        'airline': '航空和运输',
        'pharma': '医药',
        'agriculture': '农业',
        'consumer': '零售和消费品',
        'media': '传媒和文化',
        'entertainment': '娱乐'
    };
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
    var savedFollowListJSON = await getPreferenceFollowsForDisplay();
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
        var itemAreas = item.getAttribute('data-area') || '';
        var itemTopics = item.getAttribute('data-topic') || '';
        var itemIndusties = item.getAttribute('data-industry') || '';
        itemKeywords += ',' + itemAuthors + ',' + itemAreas + ',' + itemTopics + ',' + itemIndusties; 
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
                            var itemDisplay = checkItemFor[j];
                            if (dict[itemDisplay]) {
                                itemDisplay = dict[itemDisplay];
                            }
                            itemTagLink.innerHTML = itemDisplay;
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
