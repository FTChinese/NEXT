/* jshint devel:true */
(function () {
    'use strict';
    //var actionType = 'create';
    var actionType = 'edit';
    var pageId = '';
    var domId = 'content-left-inner';
    var dataRules = {
        'lists': 'array',
        'items': 'item',
        'type': 'readonly',
        'theme': ['default', 'luxury', 'myFT', 'technology', 'lifestyle', 'ebook'],
        //'type': ['block', 'banner', 'header', 'footer'],
        'side': ['none', 'HomeRightRail','TagRightRail', 'MostPopular', 'HotVideos', 'MarketsData', 'videos', 'MostCommented'],
        'sideAlign': ['right', 'left'],
        'float': ['none', 'left', 'right', 'oneline', 'SideBySide', 'myFT', 'IconTitle', 'Card', 'eBook', 'Headshot', 'ScoreBoard'],
        'showTag': ['no', 'yes'],
        'showTimeStamp': ['no', 'new stories', 'all'],
        'from': ['', 'MarketsData', 'SpecialReports', 'Columns', 'Channels', 'Events', 'MyTopics', 'Discover', 'Marketing', 'findpassword'],
        'fromSide': ['PartnerActivity'],
        'sideOption': ['headlineOnly', 'leadOnly', 'imageAndText', 'textOverImage'],
        'preferLead': ['longlead', 'shortlead', 'none'],
        'feedType': ['all','story','video','interactive','photo','job', 'myFT', 'fav', 'ftc_columns', 'ft_columns'],
        'feedItems': 'number',
        'feedStart': 'number',
        'feedImage': ['optional','necessary','hide'],
        'language': ['', 'en', 'ce'],
        'fit': ['', 'standard', 'highimpact', 'legacy']
    };
    var dataRulesTitle = {
        'theme': 'Luxury是指乐尚街的配色风格，主要特点是Title和分割线为金色',
        'side': '采用事先写好的模版',
        'name': '仅供编辑内部沟通，不会被读者看见，尽量采用英文的name',
        'title': 'list的title会被读者看见，请使用中文',
        'url': '可以填写标签，或者url，程序会自动识别并产生正确的链接',
        'sideAlign': ' 这个Block的侧边栏放在右边还是左边',
        'float': '如果某个list有文章没有配图，可以采用float到左边的方式来展示这个List，同时其余的list自动float到右边；如果想要某个list，如cover占据全部宽度，则设定其为oneline；如果想要像myFT那样一行一条内容，则选择myFT；想要强制设定这个List所有内容都采用同样的展现形式，则选择Card',
        'showTag': '程序会抓取tag字段中第一个tag做为primary tag来显示',
        'showTimeStamp': 'new stories代表只在文章发布的一个小时内显示时间，all代表在所有情况下都显示时间',
        'from': '选取事先写好的模版',
        'sideOption': 'headlineOnly表示只显示标题；leadOnly表示只显示lead，这个功能可以用来展示联系方式一类的文字信息；imageAndText显示方式类似微信公众号的图文信息，第一条出大图',
        'preferLead': '优先显示的lead类型',
        'feedType': '自动抓取的内容类型，如果选择all则四种类型都抓取，最新的先显示',
        'feedImage': 'Optional代表不要求抓出来的内容必须有配图，Necessary则要求内容必须有配图',
        'feedItems': '自动抓取内容的条数上限，如果这个list中有手动拖入的内容，则不显示自动抓取的内容',
        'feedStart': '自动抓取内容的条数开始的Index，从0开始数',
        'feedTag': '自动抓取内容依据的标签，如果抓取条件复杂，也可以请技术帮助你输入mysql的查询语句',
        'language': '中文、英文或者中英文对照，只适用于story'
    };
    var toolkits = {
        'section': {
            'block': ['title', 'name', 'side', 'sideAlign'],
            'include': ['from', 'side', 'sideAlign'],
            'header': [],
            'banner': ['position', 'image', 'highImpactImage', 'url', 'fit'],
            'footer': []
        },
        'list': {
            'list': ['name', 'title', 'url', 'language', 'description', 'style', 'float', 'showTag', 'showTimeStamp', 'preferLead', 'sponsorAdId', 'sponsorLogoUrl', 'sponsorLink', 'sponsorNote', 'feedStart', 'feedItems', 'feedTag', 'feedType', 'feedImage', 'moreLink'],
            'SideMPU': ['name', 'image', 'url'],
            'SideWithItems':['name', 'title', 'url', 'sideOption', 'feedItems', 'feedTag', 'feedType'],
            'SideRanking': ['name', 'title', 'url', 'feedItems', 'feedTag', 'feedType'],
            'SideInclude': ['name', 'title', 'url', 'fromSide']
        }
    };
    var devices = [
        {'name': 'PC or Mac', 'width': '', 'height': ''},
        {'name': 'iPhone 5', 'width': 320, 'height': 580},
        {'name': 'iPhone 6', 'width': 375, 'height': 627},
        {'name': 'iPhone 6 Plus', 'width': 414, 'height': 736},
        {'name': 'iPad LandScape', 'width': 1024, 'height': 748},
        {'name': 'iPad Portrait', 'width': 768, 'height': 1024},
        {'name': 'Huawei Mate 8', 'width': 540, 'height': 960},
        {'name': 'Google Nexus 7', 'width': 600, 'height': 960},
        {'name': 'Email', 'width': '', 'height': '', 'view': 'email'}
    ];
    var thisday = new Date();
    var thenow = thisday.getHours() * 10000 + thisday.getMinutes() * 100 + thisday.getSeconds();
    var todaydate = thisday.getFullYear() + '-' + (thisday.getMonth() + 1) + '-' + thisday.getDate();
    var pagemakerAPIRoot = '/falcon.php/pagemaker/';
    var storyAPIRoot = '/falcon.php/homepage/getstoryapi/';
    var gApiUrls = {
        //'home': 'api/page/home.json',
        'home': pagemakerAPIRoot + 'get/'+ getURLParameter('page') +'/' + todaydate + '?' + thenow,
        'homePOST': pagemakerAPIRoot + 'post/'+ getURLParameter('page') +'/' + todaydate,
        'blank': 'api/page/blank.json',
        'stories': storyAPIRoot + todaydate + '?' + thenow
    };
    var gApiUrlsLocal = {
        'home': 'api/page/home.json',
        'homePOST': 'api',
        'blank': 'api/page/blank.json',
        'stories': 'api/page/stories.json'
    };

    //drag and drop
    var dragSrcEl = null;
    var dragIndex;
    var dragOverIndex;
    var customPageJSON;

    // get parameter value from url

    /* jshint ignore:start */
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }
    /* jshint ignore:end */


    //将Unix时间戳转换为中文日期和星期
    function unixtochinese(thetime, datetype) {
        var todaystamp, dayArray, dayChar, thehour, theminute, ampm, currentDate, currentDateStamp, itemDateStamp;
        if (thetime === 'hide') {
            return '';
        }
        currentDate = new Date();
        currentDateStamp = currentDate.getFullYear() * 10000 + (currentDate.getMonth() + 1) * 100 + currentDate.getDate();
        thisday = new Date(thetime * 1000);
        itemDateStamp = thisday.getFullYear() * 10000 + (thisday.getMonth() + 1) * 100 + thisday.getDate();
        todaystamp = thisday.getFullYear() + '年' + (thisday.getMonth() + 1) + '月' + thisday.getDate() + '日 星期';
        dayArray = '日一二三四五六';
        dayChar = dayArray[thisday.getDay()];
        todaystamp += dayChar;
        thehour = thisday.getHours();
        thehour = ('0' + thehour).slice(-2);
        theminute = thisday.getMinutes();
        theminute = ('0' + theminute).slice(-2);
        ampm = (thehour < 12) ? 'AM' : 'PM';
        if (datetype === 1) {
            todaystamp = ' ' + thehour + ':' + theminute + ' ' + ampm;
        } else if (datetype === 2) {
            //console.log (currentDateStamp);
            //console.log (todaystamp);
            if (currentDateStamp === itemDateStamp) {
                todaystamp = thehour + ':' + theminute;
            } else {
                todaystamp = (thisday.getMonth() + 1) + '/' + thisday.getDate() + ' ' + thehour + ':' + theminute;
            }
        } else if (datetype === 3) {
            if (/^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}$/gi.test(thetime)) {
                //console.log (thetime);
                todaystamp = thetime.replace(/^[0-9]{4}\-([0-9]{1,2}\-[0-9]{1,2})$/g, '$1');
                todaystamp = todaystamp.replace(/^0/g, '').replace(/\-0/g, '/').replace('-', '/');
            } else {
                todaystamp = (thisday.getMonth() + 1) + '/' + thisday.getDate();
            }
        }
        return todaystamp;
    }

    function renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage, relativestory, showRelativeStoryItems) {
        var editLink = '';
        var previewLink = '';
        var dataHTML = '';
        var oTimeStamp = timeStamp || Math.round(new Date().getTime()/1000);
        var relativestoryHTML = '';
        var hasImageClass = '';
        var imageBG = '';
        var sponsorImage = '';
        var sponsorImageDisplay = '';
        if (showSponsorImage === 'yes') {
            sponsorImageDisplay = ' checked';
        }
        sponsorImage = '<div title="如果是有赞助的特别报道，优先采用专题的图片，而不是文章的图片"><input title="use sponsor image" name="preferSponsorImage" class="o-input-checkbox" value="yes" type="checkbox"' + sponsorImageDisplay + '>Prefer Sponsor Cover 1</div>';
        if (typeof showRelativeStoryItems !== 'undefined') {
            showRelativeStoryItems = '<div class="item-info-item"><div class="item-info-title">Show Related Items: </div><input type="number" title="How Many Related Content Would You Like to Show in This Page? " name="showRelativeStoryItems" class="o-input-text" value="' + showRelativeStoryItems + '"></div>';
        } else {
            showRelativeStoryItems = '';
        }
        if (type === 'story') {
            editLink = 'https://backyard.ftchinese.com/falcon.php/story/edit/' + id;
            previewLink = 'http://www7.ftchinese.com/story/' + id;
        } else if (type === 'interactive') {
            editLink = 'https://backyard.ftchinese.com/falcon.php/ia/edit/' + id;
            previewLink = 'http://www7.ftchinese.com/interactive/' + id;
        } else if (type === 'photo') {
            editLink = 'https://backyard.ftchinese.com/falcon.php/pics/edit_photonews/' + id;
            previewLink = 'http://www7.ftchinese.com/photonews/' + id;
        } else if (type === 'video') {
            editLink = 'https://backyard.ftchinese.com/create_videostory.php?id=' + id;
            previewLink = 'http://www7.ftchinese.com/video/' + id;
        }
        if (timeStamp !== '') {
            timeStamp = unixtochinese(timeStamp, timeStampType);
        } else {
            timeStamp = '<div class="new-item"></div>';
        }

        if (image !== '') {
            hasImageClass = ' has-image';
            imageBG = image.replace('/upload/', '/');
            //imageBG = image.replace('i.ftimg.net', 'i.ftmailbox.com').replace('/upload/', '/');
            imageBG = encodeURIComponent(imageBG);
            imageBG = 'http://image.webservices.ft.com/v1/images/raw/' + imageBG + '?source=ftchinese&width=80&fit=scale-down';
            imageBG = ' style="background-image: url(' + imageBG + ')"';
        }

        if (typeof relativestory === 'object') {
            $.each(relativestory, function (key, value) {
                var cheadline = value.cheadline || value.headline || '';
                var id = value.id || '';
                var type = value.type || 'story';
                if (type === '0') {
                    type = 'story';
                } else if (type === '1') {
                    type = 'video';
                }
                //console.log (cheadline);
                relativestoryHTML += '<div class="relative-item" draggable=true><div class="remove-relative"></div><div class="relative-title">' + cheadline + '</div><div class="relative-info"><input title="headline" name="headline" class="r-input-text" value="' + cheadline + '"></div><input type="hidden" readonly name="id" class="r-input-text" value="' + id + '"><input type="hidden" readonly name="type" class="r-input-text" value="' + type + '"></div>';
            });
            relativestoryHTML = '<div class="item-info-title relative-container-title">Related Content: </div><div class="relative-container">' + relativestoryHTML + '</div>';
        }
        //console.log (relativestoryHTML);
        //relativestoryHTML = '';
        dataHTML = '<div draggable=true data-type="' + type + '" class="item ' + type + hasImageClass + '"' + imageBG + ' data-id="' + id + '"><div class="remove-item"></div><div class="timestamp">' + timeStamp + '</div><div class="item-title">' + headline + '</div><div class="item-info"><div class="item-links"><a href="http://www7.ftchinese.com/' + type + '/' + id + '" target=_blank>Preview</a><a href="' + editLink + '" target=_blank>Edit</a></div>'+sponsorImage+'<div class="item-info-item"><input title="headline" placeholder="headline" name="headline" class="o-input-text" value="' + headline + '"></div><div class="item-info-item"><input title="image" placeholder="image" name="image" class="o-input-text" value="' + image + '"></div><div class="item-info-item"><div class="item-info-title">Long Lead: </div><textarea title="image" placeholder="Long Lead" name="longlead" class="o-input-text">' + longlead + '</textarea></div><div class="item-info-item"><div class="item-info-title">Short Lead: </div><textarea title="short lead" placeholder="short lead" name="shortlead" class="o-input-text">' + shortlead + '</textarea></div><div class="item-info-item"><input title="tag" placeholder="tag" name="tag" class="o-input-text" value="' + tag + '"></div><div class="item-info-item"><input title="custom link" placeholder="custom link" name="customLink" class="o-input-text" value="' + customLink + '"></div>' + showRelativeStoryItems + '<div class="item-info-item"><input name="timeStamp" type="hidden" class="o-input-text" value="' + oTimeStamp + '" readonly><input type="hidden" name="type" class="o-input-text" value="' + type + '" readonly><input type="hidden" name="id" class="o-input-text" value="' + id + '" readonly></div>' + relativestoryHTML + '</div></div>';
        return dataHTML;
    }


    function renderItem(data) {
        var id = data.id;
        var headline = data.headline;
        var longlead = data.longlead || '';
        var shortlead = data.shortlead || '';
        var image = data.image || '';
        var type = data.type || '';
        var timeStamp = data.timeStamp || '';
        var timeStampType = 2;
        var tag = data.tag || '';
        var relatives = data.relatives || [];
        var showRelativeStoryItems = data.showRelativeStoryItems || 0;
        var customLink = data.customLink || '';
        var showSponsorImage = data.preferSponsorImage || 'no';
        if (type !== 'story') {
            timeStampType = 3;
        }
        return renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage, relatives, showRelativeStoryItems);
    }


    function renderMeta(data) {
        var metaHTML = '';
        var dataHTML = '';
        $.each(data, function (key, value) {
            var arrayMeta = '';
            var description = dataRulesTitle[key] || '';
            if (description !== '') {
                description = ' title="' + description + '"';
            }
            if (dataRules[key] === 'array' || dataRules[key] === 'item') {
                $.each(value, function (k, v) {
                    var title = v.title || v.name || v.type || 'List';
                    var itemLength = 0;
                    if (v.items !== undefined && v.items.length > 0) {
                        itemLength = ' <span>(' + v.items.length + ')</span>';
                    } else {
                        itemLength = '';
                    }
                    //console.log (v.items.length);
                    if (dataRules[key] === 'array') {
                        arrayMeta = renderMeta(v);
                        dataHTML += '<div class="' + key + '-item"><div class="remove-' + key + '"></div><div class="' + key + '-header" draggable=true>' + title + itemLength + '</div>' + arrayMeta + '</div>';
                    } else {
                        arrayMeta = renderItem(v);
                        dataHTML += arrayMeta;
                    }
                });
            } else if (dataRules[key] === 'readonly') {
                metaHTML += '<tr class="meta-item"><td class="first-row"><input type="text" class="o-input-text" value="' + key + '" readonly'+description+'></td><td><input data-key="' + key + '" type="text" class="o-input-text" value="' + value + '" readonly></td></tr>';
            } else if (dataRules[key] === 'number') {
                metaHTML += '<tr class="meta-item"><td class="first-row"><input type="text" class="o-input-text" value="' + key + '" readonly'+description+'></td><td><input data-key="' + key + '" type="number" class="o-input-text" value=' + (value || 0) + '></td></tr>';
            } else if (typeof dataRules[key] === 'string') {
                metaHTML += '<tr class="meta-item"><td class="first-row"><input type="text" class="o-input-text" value="' + key + '"'+description+'></td><td><input data-key="' + key + '" type="text" class="o-input-text" value="' + value + '"></td></tr>';
            } else if (typeof dataRules[key] === 'object') {
                var options = '';
                $.each(dataRules[key], function (k1, v1) {
                    var selected = '';
                    if (v1 === value) {
                        selected = ' selected';
                    }
                    options += '<option value="' + v1 + '"' + selected + '>' + v1 + '</option>';
                });
                metaHTML += '<tr class="meta-item"><td class="first-row"><input class="o-input-text" value="' + key + '" type="text" readonly'+description+'></td><td><select data-key="' + key + '" class="o-input-text">' + options + '</select></td></tr>';
            } else {
                metaHTML += '<tr class="meta-item"><td class="first-row"><input class="o-input-text" value="' + key + '" type="text" readonly'+description+'></td><td><input type="text" data-key="' + key + '" class="o-input-text" value="' + value + '"></td></tr>';
            }
        });
        dataHTML = '<div class="lists-container">' + dataHTML + '</div>';
        metaHTML = '<table class="meta-table">' + metaHTML + '</table>';
        return metaHTML + dataHTML;
    }

    function renderJson(jsonData) {
        //render meta data into HTML Dom
        var metaHTML = '';
        metaHTML = renderMeta(jsonData.meta);

        //render sections into HTML Dom
        var sectionsHTML = '';
        $.each(jsonData.sections, function (key, value) {
            var sectionMeta = renderMeta(value);
            var title = value.title || value.name || value.from || value.type || 'Section';
            var sectionType = value.type || '';
            var sectionLength;
            if (value.lists !== undefined && value.lists.length > 0) {
                sectionLength = ' <span>(' + value.lists.length + ')</span>';
            } else {
                sectionLength = '';
            }
            sectionType = (sectionType !== '') ? 'type-' + sectionType : '';
            sectionsHTML += '<div class="section-container ' + sectionType + '"><div class="section-inner"><div class="remove-section"></div><div class="section-header" draggable=true>' + title + sectionLength + '</div>' + sectionMeta + '</div></div>';
        });
        sectionsHTML = '<div class="sections">' + sectionsHTML + '</div>';


        $('#' + domId).html(metaHTML + sectionsHTML);
    }

    function wrapItemHTML(htmlCode, groupTitle) {
        if (htmlCode !== '') {
            return '<div class="group-container"><div class="group-header" draggable=true>' + groupTitle + '</div><div class="group-inner">' + htmlCode + '</div></div>';
        }
        return '';
    }

    function tidyup() {
        $('.animated').removeClass('animated');
    }

    function loadStories() {
        $.ajax({
            type: 'get',
            url: gApiUrls.stories,
            dataType: 'json',
            success: function (data) {
                var storiesInner = '';
                var photosInner = '';
                var interactivesInner = '';
                var videosInner = '';
                var coverHTML = '';
                var newsHTML = '';
                var commentsHTML = '';
                var otherHTML = '';
                $.each(data, function (entryIndex, entry) {
                    var timeStamp = '';
                    var timeStampType = 2;
                    var headline = '';
                    var id = '';
                    var longlead = '';
                    var shortlead = '';
                    var image = '';
                    var type = '';
                    var priority = 0;
                    var tag = '';
                    var relativestory = [];
                    var showRelativeStoryItems = 0;
                    var customLink = '';
                    var showSponsorImage = 'no';
                    if (entry.id) {
                        //console.log (entry.last_publish_time);
                        timeStamp = entry.last_publish_time || '';
                        if (entry.publish_status === 'draft') {
                            timeStamp = '';
                        }
                        timeStampType = 2;
                        id = entry.id;
                        headline = entry.cheadline;
                        longlead = entry.clongleadbody || '';
                        shortlead = entry.cshortleadbody || '';
                        tag = entry.tag || '';
                        //shortlead = JSON.stringify(entry);
                        image = entry.story_pic.cover || entry.story_pic.other || entry.story_pic.Other || entry.story_pic.smallbutton || entry.story_pic.bigbutton || '';
                        type = 'story';
                        priority = entry.priority;
                        relativestory = entry.relativestory || [];
                        customLink = entry.customLink || '';
                        //shortlead = JSON.stringify(relativestory);
                        if ($('.content-left-inner .item[data-id=' + id + '][data-type=' + type + ']').length === 0) {
                            if (priority > 0 && priority <= 9) {
                                coverHTML += renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage, relativestory, showRelativeStoryItems);
                            } else if (priority >= 20 && priority <= 49) {
                                newsHTML += renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage, relativestory, showRelativeStoryItems);
                            } else if ((priority >= 49 && priority <= 69) || (priority >= 10 && priority <= 19)) {
                                commentsHTML += renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage, relativestory, showRelativeStoryItems);
                            } else {
                                otherHTML += renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage, relativestory, showRelativeStoryItems);
                            }
                        } else {
                            //console.log (headline + ' already exists');
                        }
                    } else if (entryIndex === 'photonews') {
                        $.each(entry, function (photoIndex, photo) {
                            id = photo.photonewsid;
                            timeStamp = photo.add_times || '';
                            timeStampType = 3;
                            headline = photo.cn_title;
                            longlead = photo.leadbody || '';
                            shortlead = photo.shortlead || '';
                            tag = photo.tags || '';
                            tag = '图辑,' + tag;
                            //shortlead = JSON.stringify(photo);
                            image = photo.illustration || photo.cover || photo.thumb_url || '';
                            if (image !== '') {
                                image = 'http://i.ftimg.net/' + image;
                            }
                            type = 'photo';
                            if ($('.content-left-inner .item[data-id=' + id + '][data-type=' + type + ']').length === 0) {
                                photosInner += renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage);
                            }
                        });
                    } else if (entryIndex === 'interactive') {
                        $.each(entry, function (interactiveIndex, interactive) {
                            var mainTag = '';
                            id = interactive.id;
                            timeStamp = interactive.pubdate || '';
                            timeStampType = 3;
                            headline = interactive.cheadline;
                            longlead = interactive.clongleadbody || '';
                            shortlead = interactive.cshortleadbody || '';
                            tag = interactive.tag || '';
                            if (tag.indexOf('速读') >= 0) {
                                mainTag = '速读';
                            } else if (/一周新闻|QuizPlus|速读|音频|SurveyPlus/i.test(tag)) {
                                mainTag = 'FT商学院';
                            }
                            if (mainTag !== '') {
                                tag = mainTag + ',' + tag.replace(mainTag, '');
                                tag = tag.replace(/[,,]+/g, ',');
                            }
                            if (longlead.indexOf('|') > 0 && shortlead !== '') {
                                longlead = shortlead;
                            }
                            image = interactive.story_pic.other || interactive.story_pic.smallbutton || interactive.story_pic.cover || interactive.story_pic.bigbutton || '';
                            type = 'interactive';
                            if ($('.content-left-inner .item[data-id=' + id + '][data-type=' + type + ']').length === 0) {
                                interactivesInner += renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage);
                            }
                        });
                    } else if (entryIndex === 'video') {
                        $.each(entry, function (videoIndex, video) {
                            id = video.id;
                            timeStamp = video.pubdate || '';
                            timeStampType = 3;
                            headline = video.cheadline;
                            longlead = video.clongleadbody || '';
                            shortlead = video.cshortleadbody || '';
                            shortlead = JSON.stringify(video);
                            tag = video.tag || '';
                            tag = '视频,' + tag;
                            image = video.story_pic.other || video.story_pic.smallbutton || video.story_pic.cover || video.story_pic.bigbutton || '';
                            type = 'video';
                            if ($('.content-left-inner .item[data-id=' + id + '][data-type=' + type + ']').length === 0) {
                                videosInner += renderAPI(id, headline, timeStamp, timeStampType, longlead, shortlead, image, type, tag, customLink, showSponsorImage);
                            }
                        });
                    }
                });
                coverHTML = wrapItemHTML(coverHTML, 'Cover');
                newsHTML = wrapItemHTML(newsHTML, 'News');
                commentsHTML = wrapItemHTML(commentsHTML, 'Comments');
                otherHTML = wrapItemHTML(otherHTML, 'Other Stories');
                videosInner = wrapItemHTML(videosInner, 'Videos');
                interactivesInner = wrapItemHTML(interactivesInner, 'Interactive Features');
                photosInner = wrapItemHTML(photosInner, 'Photo Slides');
                storiesInner = coverHTML + newsHTML + commentsHTML + otherHTML;
                $('#stories-inner').html(storiesInner + videosInner + interactivesInner + photosInner);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('errorThrown - [' + errorThrown + ']');
            }
        });
    }

    function loadTools() {
        var sections = '';
        var lists = '';
        $.each(toolkits.section, function (key, value) { // jshint ignore:line
            sections += '<div class="toolkit toolkit-section toolkit-' + key + '" draggable=true>' + key + '</div>';
        });
        $.each(toolkits.list, function (key, value) { // jshint ignore:line
            lists += '<div class="toolkit toolkit-list toolkit-' + key + '" draggable=true>' + key + '</div>';
        });
        lists += renderAPI('', 'Empty Item 1', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 2', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 3', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 4', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 5', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 6', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 7', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 8', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 9', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 10', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 11', '', '', '', '', '', '', '', '', 'no');
        lists += renderAPI('', 'Empty Item 12', '', '', '', '', '', '', '', '', 'no');
        //lists = '<div class="toolkit toolkit-list" draggable=true>list</div>';
        $('#tool-sec-inner').html(sections);
        $('#tool-list-inner').html(lists);
    }

    function jsonToDom(jsonUrl) {
        $.ajax({
            type: 'get',
            url: jsonUrl,
            dataType: 'json',
            success: function (data) {
                renderJson(data);
                loadStories();
                loadTools();
                $('#source-json').val(JSON.stringify(data));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('errorThrown - [' + errorThrown + ']');
            }
        });
    }

    function renderHTML(ele) {
        var J = {
            'meta': {},
            'sections': []
        };
        var mainMeta = ele.find('>.meta-table .meta-item');
        var sections = ele.find('>.sections>.section-container');
        // render page meta data into JSON
        $.each(mainMeta, function () {
            var key = $(this).find('.o-input-text').eq(0).val();
            var value = $(this).find('.o-input-text').eq(1).val();
            J.meta[key] = value;
        });

        // render section data
        $.each(sections, function (sectionIndex) {
            var lists = $(this).find('>.section-inner>.lists-container>.lists-item');
            J.sections.push({});
            $.each($(this).find('.section-inner>.meta-table .meta-item'), function () {
                var key = $(this).find('.o-input-text').eq(0).val();
                var value = $(this).find('.o-input-text').eq(1).val();
                //console.log (index + ': ' + key + "/" + value);
                J.sections[sectionIndex][key] = value;
            });
            if (lists.length > 0) {
                J.sections[sectionIndex].lists = [];
                $.each(lists, function (listIndex) {
                    //console.log (sectionIndex + ': ' + listIndex);
                    var items = $(this).find('.item');
                    J.sections[sectionIndex].lists.push({});

                    $.each($(this).find('>.meta-table .meta-item'), function () {

//						J.sections[sectionIndex].lists[listIndex].push({});
                        var key = $(this).find('.o-input-text').eq(0).val();
                        var value = $(this).find('.o-input-text').eq(1).val();
                        J.sections[sectionIndex].lists[listIndex][key] = value;
                    });


                    if (items.length > 0) {
                        //console.log (items.length);
                        J.sections[sectionIndex].lists[listIndex].items = [];
                        $.each(items, function (itemIndex) {
                            J.sections[sectionIndex].lists[listIndex].items.push({});
                            $.each($(this).find('.o-input-text, .o-input-checkbox'), function () {

                                var key = $(this).attr('name');
                                var value;
                                if ($(this).hasClass('o-input-checkbox') === true) {
                                    value = ($(this).is(':checked')) ? 'yes' : 'no';
                                } else {
                                    value = $(this).val();
                                }
                                //console.log ($(this).html());
                                J.sections[sectionIndex].lists[listIndex].items[itemIndex][key] = value;
                            });

                            var relatives = $(this).find('.relative-item');
                            if (relatives.length > 0) {
                                //console.log(relatives.length + ' related items');
                                J.sections[sectionIndex].lists[listIndex].items[itemIndex].relatives = [];
                                $.each(relatives, function (relativeIndex) {
                                    J.sections[sectionIndex].lists[listIndex].items[itemIndex].relatives.push({});
                                    $.each($(this).find('.r-input-text'), function () {

                                        var key = $(this).attr('name');
                                        var value = $(this).val();
                                        //console.log ($(this).html());
                                        J.sections[sectionIndex].lists[listIndex].items[itemIndex].relatives[relativeIndex][key] = value;
                                    });
                                });
                            }

                        });

                    }

                });
            }
        });
        return JSON.stringify(J);
    }


    function updateSectionTitle(ele) {
        var obj = ele.parentsUntil($('.sections'), '.section-inner>.meta-table');
        var objContainer = ele.parentsUntil($('.sections'), '.section-container');
        //console.log (obj);
        var title = obj.find('[data-key=title]').val() || obj.find('[data-key=name]').val() || obj.find('[data-key=from]').val() || obj.find('[data-key=type]').val() || 'New List';
        var listsLength;
        //console.log (objContainer.html());
        if (objContainer.find('.lists-item') && objContainer.find('.lists-item').length > 0) {
            listsLength = ' <span>(' + objContainer.find('.lists-item').length + ')</span>';
        } else {
            listsLength = '';
        }
        //console.log (title);
        objContainer.find('.section-header').html(title + listsLength);
    }

    function updateListTitle(ele) {
        var obj = ele.parentsUntil($('.lists-container'), '.lists-item>.meta-table');
        var objContainer = ele.parentsUntil($('.lists-container'), '.lists-item');
        //console.log (obj);
        var title = obj.find('[data-key=title]').val() || obj.find('[data-key=name]').val() || obj.find('[data-key=type]').val() || 'New List';
        //console.log (title);
        var listsLength;
        if (objContainer.find('.item') && objContainer.find('.item').length > 0) {
            listsLength = ' <span>(' + objContainer.find('.item').length + ')</span>';
        } else {
            listsLength = '';
        }
        objContainer.find('.lists-header').html(title + listsLength);
    }

    function updateAllTitles() {
        $('.section-container').each(function () {
            var obj = $(this).find('.section-inner>.meta-table .o-input-text');
            if (obj.length > 0) {
                updateSectionTitle(obj.eq(0));
            }
        });

        $('.lists-item').each(function () {
            var obj = $(this).find('>.meta-table .o-input-text');
            if (obj.length > 0) {
                updateListTitle(obj.eq(0));
            }
        });
    }

    function searchAPI() {
        var k = $('#keywords-input').val();
        k=k.replace(/\//g,'-');
        thisday = new Date();
        thenow = thisday.getHours() * 10000 + thisday.getMinutes() * 100 + thisday.getSeconds();
        if (/[0-9]{4}\-[0-9]+\-[0-9]+/.test(k)) {
            gApiUrls.stories = storyAPIRoot + k + '?' + thenow;
        } else if (/^[0-9]+$/.test(k)) {
            //https://backyard.ftchinese.com/falcon.php/homepage/getstorybyday/7/dfadfa
            gApiUrls.stories = '/falcon.php/homepage/getstorybyday/' + k + '/'+ thenow;
        } else {
            gApiUrls.stories = '/falcon.php/homepage/gettagstoryapi?tag=' + k + '&' + thenow;
            //alert (gApiUrls.stories);
            //http://backyard.ftchinese.com/falcon.php/homepage/gettagstoryapi?tag=%E4%B8%AD%E5%9B%BD%E7%BB%8F%E6%B5%8E
        }

        $('#stories-inner').empty();
        loadStories();
    }

    $('body').on('dragstart', '.item, .relative-item, .section-header, .lists-header, .toolkit, .group-header', function (e) {
        try {
            e.originalEvent.dataTransfer.setData('text/plain', 'anything');
        } catch (ignore) {

        }
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        if ($(this).is('.item, .toolkit, .relative-item')) {
            //$(this).css('opacity','0.4');
            $(this).addClass('fade');
        } else if ($(this).hasClass('group-header')) {
            $(this).parent().addClass('fade');
        } else if ($(this).hasClass('section-header')) {
            $('.sections .section-container').each(function (index) {
                $(this).attr('data-order', index);
            });
            $(this).parentsUntil($('.sections'), '.section-container').addClass('fade');
            dragIndex = $(this).parentsUntil($('.sections'), '.section-container').attr('data-order');
            dragIndex = parseInt(dragIndex, 10);
        } else if ($(this).hasClass('lists-header')) {
            $('.lists-item').each(function (index) {
                $(this).attr('data-order', index);
            });
            $(this).parent().addClass('fade');
            dragIndex = $(this).parent().attr('data-order');
            dragIndex = parseInt(dragIndex, 10);
        }
        dragSrcEl = $(this);
    });

    $('body').on('dragend', '.item, .relative-item, .section-header, .lists-header, .toolkit, .group-header', function (e) {
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        if ($(this).is('.item, .relative-item, .toolkit')) {
            $('.item, .toolkit').removeClass('fade');
        } else if ($(this).hasClass('group-header')) {
            $(this).parent().removeClass('fade');
        } else if ($(this).hasClass('section-header')) {
            $(this).parentsUntil($('.sections'), '.section-container').removeClass('fade');
        } else if ($(this).hasClass('lists-header')) {
            $(this).parent().removeClass('fade');
        }
        // remove visual feedbacks
        $('.over').removeClass('over');
        $('.over-drag-down').removeClass('over-drag-down');
        $('.over-drag-up').removeClass('over-drag-up');
        $('.fade').removeClass('fade');
    });

    $('body').on('dragenter', '.item, .relative-item, .relative-container-title, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header, .content-left-inner', function () {
        //console.log (dragSrcEl);

        if (dragSrcEl.is('.item, .group-header') && $(this).is('.item, .lists-item>.meta-table, .lists-item>.lists-header')) {
            $(this).addClass('over');
        } else if (dragSrcEl.hasClass('relative-item') && $(this).is('.relative-item, .relative-container-title')) {
            $(this).addClass('over');
        } else if (dragSrcEl.hasClass('section-header') && $(this).hasClass('section-container')) {
            dragOverIndex = $(this).attr('data-order');
            dragOverIndex = parseInt(dragOverIndex, 10);
            if (dragIndex < dragOverIndex) {
                $(this).addClass('over-drag-down');
            } else if (dragIndex > dragOverIndex) {
                $(this).addClass('over-drag-up');
            }
        } else if (dragSrcEl.hasClass('toolkit-section')) {
            if ($(this).hasClass('section-container')) {
                $(this).addClass('over-drag-down');
            } else if ($(this).hasClass('content-left-inner') && $('.section-container').length === 0) {
                $(this).addClass('over');
            }
        } else if (dragSrcEl.hasClass('lists-header') && $(this).is('.lists-item, .section-inner>.meta-table, .section-header')) {
            if ($(this).hasClass('lists-item')) {
                dragOverIndex = $(this).attr('data-order');
                dragOverIndex = parseInt(dragOverIndex, 10);
                if (dragIndex < dragOverIndex) {
                    $(this).addClass('over-drag-down');
                } else if (dragIndex > dragOverIndex) {
                    $(this).addClass('over-drag-up');
                }
            } else {
                $(this).addClass('over');
            }
        } else if (dragSrcEl.hasClass('toolkit-list') && $(this).is('.lists-item, .section-inner>.meta-table, .section-header')) {
            if ($(this).hasClass('lists-item')) {
                $(this).addClass('over-drag-down');
            } else {
                $(this).addClass('over');
            }
        }
    });

    $('body').on('dragover', '.item, .relative-item, .relative-container-title, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header, .content-left-inner', function (e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        //console.log (this.classList);
        if (dragSrcEl.is('.item, .group-header') && $(this).is('.item, .lists-item>.meta-table, .lists-item>.lists-header')) {
            $(this).addClass('over');
        } else if (dragSrcEl.hasClass('relative-item') && $(this).is('.relative-item, .relative-container-title')) {
            $(this).addClass('over');
        } else if (dragSrcEl.hasClass('section-header') && $(this).hasClass('section-container')) {
            dragOverIndex = $(this).attr('data-order');
            dragOverIndex = parseInt(dragOverIndex, 10);
            if (dragIndex < dragOverIndex) {
                $(this).addClass('over-drag-down');
            } else if (dragIndex > dragOverIndex) {
                $(this).addClass('over-drag-up');
            }
        } else if (dragSrcEl.hasClass('toolkit-section')) {
            if ($(this).hasClass('section-container')) {
                $(this).addClass('over-drag-down');
            } else if ($(this).hasClass('content-left-inner') && $('.section-container').length === 0) {
                $(this).addClass('over');
            }
        } else if (dragSrcEl.hasClass('lists-header') && $(this).is('.lists-item, .section-inner>.meta-table, .section-header')) {
            if ($(this).hasClass('lists-item')) {
                dragOverIndex = $(this).attr('data-order');
                dragOverIndex = parseInt(dragOverIndex, 10);
                if (dragIndex < dragOverIndex) {
                    $(this).addClass('over-drag-down');
                } else if (dragIndex > dragOverIndex) {
                    $(this).addClass('over-drag-up');
                }
            } else {
                $(this).addClass('over');
            }
        } else if (dragSrcEl.hasClass('toolkit-list') && $(this).is('.lists-item, .section-inner>.meta-table, .section-header')) {
            if ($(this).hasClass('lists-item')) {
                $(this).addClass('over-drag-down');
            } else {
                $(this).addClass('over');
            }
        }
    });

    $('body').on('dragleave', '.item, .relative-item, .relative-container-title, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header, .content-left-inner', function (e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        $(this).removeClass('over').removeClass('over-drag-up').removeClass('over-drag-down');
    });

    $('body').on('drop', '.item, .relative-item, .relative-container-title, .lists-item>.meta-table, .lists-item>.lists-header, .section-container, .lists-item, .section-inner>.meta-table, .section-header, .content-left-inner', function (e) {
        var newSection = '';
        var newList = '';
        var newSectionObject;
        var sectionType;
        var sectionJSON;
        var listType;
        var newListJSON;
        var newListObject;
        var groupItems;
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        // Don't do anything if dropping the same column we're dragging.
        if (dragSrcEl.hasClass('item')) {
            if ($(this).hasClass('item') === true && dragSrcEl !== this) {
                dragSrcEl.insertAfter($(this)).addClass('animated zoomIn');
            } else if ($(this).is('.lists-item>.meta-table, .lists-item>.lists-header')) {
                $(this).parent().find('.lists-container').eq(0).prepend(dragSrcEl);
                dragSrcEl.addClass('animated zoomIn');
            } /*else if ($(this).is('.type-block .section-header, .type-block .section-inner>meta-table')) {
             listsContainer = $(this).parentsUntil($('.section-container'), '.section-inner').find('.lists-item .lists-container');
             if (listsContainer.length>0) {
             listsContainer.eq(0).prepend(dragSrcEl);
             dragSrcEl.addClass('animated zoomIn');
             } else {
             alert ('Trying to drop an item to a block without list? You need to create at least one list first. Just drag a list here. ');
             }
             } */else if ($(this).is('.section-header, .section-inner>meta-table')) {
                //console.log (this.classList);
            }
        } else if (dragSrcEl.hasClass('relative-item')) {
            if ($(this).hasClass('relative-item') === true && dragSrcEl !== this) {
                dragSrcEl.insertAfter($(this)).addClass('animated zoomIn');
            } else if ($(this).hasClass('relative-container-title')) {
                $(this).parent().find('.relative-container').eq(0).prepend(dragSrcEl);
                dragSrcEl.addClass('animated zoomIn');
            } /*else if ($(this).is('.type-block .section-header, .type-block .section-inner>meta-table')) {
             listsContainer = $(this).parentsUntil($('.section-container'), '.section-inner').find('.lists-item .lists-container');
             if (listsContainer.length>0) {
             listsContainer.eq(0).prepend(dragSrcEl);
             dragSrcEl.addClass('animated zoomIn');
             } else {
             alert ('Trying to drop an item to a block without list? You need to create at least one list first. Just drag a list here. ');
             }
             } */else if ($(this).is('.section-header, .section-inner>meta-table')) {
                //console.log (this.classList);
            }
        } else if (dragSrcEl.hasClass('group-header')) {
            groupItems = dragSrcEl.parent().find('.item');
            if ($(this).hasClass('item') === true) {
                groupItems.insertAfter($(this)).addClass('animated zoomIn');
            } else if ($(this).is('.lists-item>.meta-table, .lists-item>.lists-header')) {
                $(this).parent().find('.lists-container').eq(0).prepend(groupItems);
                groupItems.addClass('animated zoomIn');
            } /*else if ($(this).is('.type-block .section-header, .type-block .section-inner>meta-table')) {
             listsContainer = $(this).parentsUntil($('.section-container'), '.section-inner').find('.lists-item .lists-container');
             if (listsContainer.length>0) {
             listsContainer.eq(0).prepend(dragSrcEl);
             dragSrcEl.addClass('animated zoomIn');
             } else {
             alert ('Trying to drop an item to a block without list? You need to create at least one list first. Just drag a list here. ');
             }
             } */else if ($(this).is('.section-header, .section-inner>meta-table')) {
                //console.log (this.classList);
            }
        } else if (dragSrcEl.hasClass('section-header')) {
            // drop a section. The drop point could be the container or its inner elements
            if ($(this).hasClass('section-container')) {
                dragOverIndex = $(this).attr('data-order');
                dragOverIndex = parseInt(dragOverIndex, 10);
                if (dragIndex < dragOverIndex) {
                    $('.section-container').eq(dragIndex).insertAfter($(this)).addClass('animated zoomIn');
                } else if (dragIndex > dragOverIndex) {
                    $('.section-container').eq(dragIndex).insertBefore($(this)).addClass('animated zoomIn');
                }
            } else if ($(this).is('.section-container .item, .lists-item>.meta-table, .lists-item>.lists-header, .section-header, .lists-item')) {
                dragOverIndex = $(this).parentsUntil($('.sections'), '.section-container').attr('data-order');
                dragOverIndex = parseInt(dragOverIndex, 10);
                if (dragIndex < dragOverIndex) {
                    $('.section-container').eq(dragIndex).insertAfter($('.section-container').eq(dragOverIndex)).addClass('animated zoomIn');
                } else if (dragIndex > dragOverIndex) {
                    $('.section-container').eq(dragIndex).insertBefore($('.section-container').eq(dragOverIndex)).addClass('animated zoomIn');
                }
            } else {
                console.log('drag section header: other situation');
                console.log(this.classList);
            }
        } else if (dragSrcEl.hasClass('toolkit-section')) {
            sectionType = dragSrcEl.html();
            sectionJSON = {
                'type': sectionType
            };
            if (sectionType === 'block') {
                sectionJSON.lists = [
                    {
                        'name': 'New List',
                        'title': '',
                        'url': '',
                        'description': '',
                        'language': '',
                        'float': 'none',
                        'showTag': 'no',
                        'showTimeStamp': 'no',
                        'preferLead': 'longlead',
                        'sponsorAdId': '',
                        'sponsorLogoUrl': '',
                        'sponsorLink': '',
                        'sponsorNote': '',
                        'feedStart': '',
                        'feedItems': '',
                        'feedTag': '',
                        'feedType': '',
                        'feedImage': 'optional',
                        'moreLink': ''
                    }
                ];
            }
            $.each(toolkits.section[sectionType], function (key, value) {
                sectionJSON[value] = '';
            });
            newSection = '<div class="section-container type-' + sectionType + '"><div class="section-inner"><div class="remove-section"></div><div class="section-header" draggable="true">' + sectionType + '</div>' + renderMeta(sectionJSON) + '</div></div>';
            newSectionObject = $($.parseHTML(newSection));
            // drop a new section. The drop point could be the container or its inner elements
            if ($(this).hasClass('section-container')) {
                $(this).after(newSectionObject);
                newSectionObject.addClass('animated zoomIn');
            } else if ($(this).is('.section-container .item, .section-container .meta-table, .lists-item>.lists-header, .section-header, .lists-item')) {
                $(this).parentsUntil($('.sections'), '.section-container').after(newSectionObject);
                newSectionObject.addClass('animated zoomIn');
            } else if ($(this).hasClass('content-left-inner') && $('.section-container').length === 0) {
                $(this).find('.sections').append(newSectionObject);
                newSectionObject.addClass('animated zoomIn');
            } else {
                console.log('create new section: other situation');
                console.log(this.classList);
            }
        } else if (dragSrcEl.hasClass('lists-header')) {
            // drop a list. The drop point could be a container or any inner elements
            if ($(this).is('.item')) {
                // drop to an item
                dragOverIndex = $(this).parentsUntil($('.sections'), '.lists-item').attr('data-order');
                dragOverIndex = parseInt(dragOverIndex, 10);
                if (dragIndex < dragOverIndex) {
                    $('.lists-item').eq(dragIndex).insertAfter($('.lists-item').eq(dragOverIndex)).addClass('animated zoomIn');
                } else if (dragIndex > dragOverIndex) {
                    $('.lists-item').eq(dragIndex).insertBefore($('.lists-item').eq(dragOverIndex)).addClass('animated zoomIn');
                }
            } else if ($(this).is('.lists-item>.meta-table, .lists-item>.lists-header')) {
                // drop to list header or list meta table
                dragOverIndex = $(this).parent().attr('data-order');
                dragOverIndex = parseInt(dragOverIndex, 10);
                if (dragIndex < dragOverIndex) {
                    $('.lists-item').eq(dragIndex).insertAfter($('.lists-item').eq(dragOverIndex)).addClass('animated zoomIn');
                } else if (dragIndex > dragOverIndex) {
                    $('.lists-item').eq(dragIndex).insertBefore($('.lists-item').eq(dragOverIndex)).addClass('animated zoomIn');
                }
            } else if ($(this).is('.section-inner>.meta-table, .section-inner>.section-header')) {
                // console.log (this.classList);
                if ($(this).parentsUntil($('.sections'), '.section-container').hasClass('type-block')) {
                    $(this).parent().find('.lists-container').eq(0).prepend($('.lists-item').eq(dragIndex));
                    $('.lists-item').eq(dragIndex).addClass('animated zoomIn');
                } else {
                    alert('A list can only be dropped to a block section! ');
                }
            } else {
                console.log('drag list header: other situation...');
                console.log(this.classList);
            }
        } else if (dragSrcEl.hasClass('toolkit-list')) {
            // drop a list. The drop point could be a container or any inner elements
            listType = dragSrcEl.html();
            newListJSON = {};
            $.each(toolkits.list[listType], function (key, value) {
                newListJSON[value] = '';
                //newListJSON.name = '';
                newListJSON.type = listType;
            });
            newList = '<div class="lists-item"><div class="remove-lists"></div><div class="lists-header" draggable="true">New List</div>' + renderMeta(newListJSON) + '</div>';
            newListObject = $($.parseHTML(newList));
            if ($(this).is('.item, .lists-item>.meta-table, .lists-item>.lists-header')) {
                // drop to an item
                $(this).parentsUntil($('.sections'), '.lists-item').after(newListObject);
                newListObject.addClass('animated zoomIn');
            } else if ($(this).is('.section-inner>.meta-table, .section-inner>.section-header')) {
                if ($(this).parentsUntil($('.sections'), '.section-container').hasClass('type-block')) {
                    $(this).parent().find('.lists-container').eq(0).prepend(newListObject);
                    newListObject.addClass('animated zoomIn');
                } else {
                    alert('A list can only be dropped to a block section! ');
                }
            } else {
                console.log('drag list header: other situation...');
                console.log(this.classList);
            }
        }

        //after a drop, update all the section titles and list titles
        updateAllTitles();

        dragSrcEl = null;
        return false;
    });

    $('body').on('click', '.tab', function () {
        $('html').removeClass('show-all').removeClass('show-sections').removeClass('show-items').removeClass('show-json');
        if ($(this).hasClass('all')) {
            $('html').addClass('show-all');
        } else if ($(this).hasClass('sections')) {
            $('html').addClass('show-sections');
        } else if ($(this).hasClass('items')) {
            $('html').addClass('show-items');
        } else if ($(this).hasClass('json')) {
            $('#source-json').val(renderHTML($('#content-left-inner')));
            $('html').addClass('show-json');
        }
    });

    $('body').on('click', '#button-save', function () {
        if (confirm('是否“保存”当前操作结果？\n\n注意：保存操作不会更新页面。')) {
            $.ajax({
                type: 'POST',
                url: gApiUrls.homePOST,
                data: {action: 'save', publish_type: getURLParameter('page'), publish_html: renderHTML($('#content-left-inner'))},
                dataType: 'text',
                success: function (msg) {
                    if (msg === 'save') {
                        alert('页面保存成功，请确认后提交！');
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('url - [' + gApiUrls.homePOST + ']');
                    console.log('XMLHttpRequest - [' + XMLHttpRequest + ']');
                    console.log('textStatus - [' + textStatus + ']');
                    console.log('errorThrown - [' + errorThrown + ']');
                }
            });
        }
    });

    $('body').on('click', '#button-submit', function () {
        if (confirm('是否“提交”当前操作结果？\n\n注意：提交操作会更新页面。')) {
            $.ajax({
                type: 'POST',
                url: gApiUrls.homePOST,
                data: {action: 'submit', publish_type: getURLParameter('page'), publish_html: renderHTML($('#content-left-inner'))},
                dataType: 'text',
                success: function (msg) {
                    if (msg === 'submit') {
                        alert('页面提交成功！');
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('url - [' + gApiUrls.homePOST + ']');
                    console.log('XMLHttpRequest - [' + XMLHttpRequest + ']');
                    console.log('textStatus - [' + textStatus + ']');
                    console.log('errorThrown - [' + errorThrown + ']');
                }
            });
        }
    });

    $('body').on('click', '#button-preview-main', function () {
        //console.log ('open');
        var devicesHTML = '';
        $.each(devices, function (key, value) {
            var viewValue = value.view || '';
            devicesHTML += '<div class="preview-on-device" data-width="' + value.width + '" data-height="' + value.height + '" data-view="' + viewValue + '">' + value.name + '</div>';
        });
        var previewHTML = '<div id="preview-shadow" class="o-overlay-shadow animated fadeIn"></div><div id="preview-box" class="rightanswer show o-overlay__arrow-top animated fadeInRight"><div class="preview-header">Simulate on the following devices: </div><div class="explain-body"><div class="explain-answer">' + devicesHTML + '</div></div>';
        $('#preview-overlay').html(previewHTML);
        tidyup();
    });

    $('body').on('click', '#preview-shadow', function () {
        $('#preview-overlay').empty();
    });

    $('body').on('click', '.preview-on-device', function () {
        var url = 'http://www7.ftchinese.com/m/corp/preview.html?pageid=' + getURLParameter('page');
        var w = $(this).attr('data-width') || $(window).width();
        var h = $(this).attr('data-height') || $(window).height();
        var viewValue = $(this).attr('data-view') || '';
        if (viewValue !== '') {
            url += '&view=' + viewValue;
        }
        window.open(url, 'newwindow', 'height=' + h + ',width=' + w + ',top=0,left=0,toolbar=no,menubar=no,resizable=no,scrollbars=yes,location=no, status=no');
    });

    $('body').on('click', '.item .item-title, .relative-item .relative-title, .lists-header', function () {
        if ($(this).parent().hasClass('expanded')) {
            $(this).parent().removeClass('expanded');
            $(this).parent().attr('draggable', true);
        } else {
            $(this).parent().addClass('expanded');
            $(this).parent().removeAttr('draggable');
        }
    });


    $('body').on('click', '.section-header', function () {
        var sectionContainer = $(this).parentsUntil($('.sections'), '.section-container');
        if (sectionContainer.hasClass('expanded')) {
            sectionContainer.removeClass('expanded');
        } else {
            sectionContainer.addClass('expanded');
        }
    });

    $('body').on('click', '.remove-item, .remove-relative, .remove-lists', function () {
        $(this).parent().slideUp(500, function () {
            $(this).remove();
            updateAllTitles();
        });
    });

    $('body').on('click', '.remove-section', function () {
        $(this).parentsUntil($('.sections'), '.section-container').slideUp(500, function () {
            $(this).remove();
            updateAllTitles();
        });
    });

    $('body').on('click', '#refresh-button', function () {
        searchAPI();
    });

    $('body').on('keyup', '#keywords-input', function(e){
        if(e.keyCode === 13) {
            searchAPI();
        }
    });


    // change section meta property
    $('body').on('change', '.section-inner>.meta-table .o-input-text', function () {
        updateSectionTitle($(this));
    });

    // change list meta
    $('body').on('change', '.lists-item>.meta-table .o-input-text', function () {
        updateListTitle($(this));
    });

    // change related story title
    $('body').on('change', '.item-info .o-input-text', function () {
        var obj = $(this).parentsUntil($('.lists-item .lists-container'), '.item');
        //console.log (obj);
        var title = obj.find('[name=headline]').val() || '';
        //console.log (title);
        obj.find('.item-title').html(title);
    });

    // change item title
    $('body').on('change', '.relative-info .o-input-text', function () {
        var obj = $(this).parentsUntil($('.relative-container'), '.relative-item');
        //console.log (obj);
        var title = obj.find('[name=headline]').val() || '';
        //console.log (title);
        obj.find('.relative-title').html(title);
    });

    // loading actions

    customPageJSON = getURLParameter('page');
    pageId = getURLParameter('id');
    if (customPageJSON !== null && customPageJSON !== '') {
        actionType = 'edit';
    } else if (customPageJSON !== null && customPageJSON !== '') {
        gApiUrlsLocal.home = 'api/page/' + customPageJSON + '.json';
        actionType = 'edit';
    } else {
        actionType = 'create';
    }

    if (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168') === 0 || window.location.hostname.indexOf('10.113') === 0 || window.location.hostname.indexOf('127.0') === 0) {
        gApiUrls = gApiUrlsLocal;
    }

    $('#keywords-input').val(todaydate);

    if (actionType === 'edit') {
        jsonToDom(gApiUrls.home);
    } else if (actionType === 'create') {
        jsonToDom(gApiUrls.blank);
        $('.tab.all').click();
    }

    window.onbeforeunload = function() {
        $.ajax({
            type: 'get',
            url: '/falcon.php/homepage/unlock',
            async: false
        });
    };

})(); 