// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
// MARK: - This has to pass through the gulp testing, so no const or for of loops, or any other modern features. 
var splitter = '-|-';
var startTime = new Date();
if (window.opener && window.opener.userName) {
    window.userName = window.opener.userName;
} else {
    window.userName = '';
}
function convertTextToArray(t) {
    var newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
    newText = newText.replace(/[\r\n]+/g, splitter);
    if (newText.split(splitter).length > 1) {return newText.split(splitter);}
    var englishInfoDiv = document.createElement('DIV');
    englishInfoDiv.innerHTML = newText;
    var htmlTexts = [];
    for (var i=0; i<englishInfoDiv.children.length; i++) {
        htmlTexts.push(englishInfoDiv.children[i].outerHTML);
    }
    return htmlTexts;
}

function addTranslation(ele) {
    if (ele.className.indexOf(' selected')>=0) {return;}
    var text = ele.innerHTML;
    ele.className += ' selected';
    ele.title = '';
    var finalTranslationEle = document.getElementById('final-translation');
    var prefix = (finalTranslationEle.value === '') ? '' : '\n\n';
    finalTranslationEle.value += prefix + text;
    var ea = ele.getAttribute('data-translation-index');
    gtag('event', ea, {'event_label': window.userName, 'event_category': 'Translation Helper', 'non_interaction': false});
}

function tidyHTML(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.innerHTML;
}

function confirmTranslation(ele) {
    if (ele.className.indexOf(' selected')>=0) {return;}
    var text = ele.innerHTML;
    ele.classList.add('selected');
    ele.title = '';
    var finalTranslationEle = ele.parentNode.parentNode.querySelector('textarea');
    var prefix = (finalTranslationEle.value === '') ? '' : '\n\n';
    var translatedText = prefix + text;
    finalTranslationEle.value += translatedText;
    var infoContainers = document.querySelectorAll('.info-container');
    var originalText = ele.parentNode.parentNode.querySelector('.info-original');
    // MARK: - You only need to translate once for the same phrase
    for (var i=0; i < infoContainers.length; i++) {
        var containerEle = infoContainers[i];
        var textEle = containerEle.querySelector('textarea');
        var originalEle = containerEle.querySelector('.info-original');
        if (originalText.innerHTML !== originalEle.innerHTML || textEle.value !== '') {continue;}
        textEle.value = translatedText;
        var infoTranslations = containerEle.querySelectorAll('.info-translation');
        for (var j=0; j<infoTranslations.length; j++) {
            var translationEle = infoTranslations[j];
            if (translationEle.innerHTML !== text) {continue;}
            translationEle.classList.add('selected');
        }
    }
    var ea = ele.getAttribute('data-translation-index');
    gtag('event', ea, {'event_label': window.userName, 'event_category': 'Translation Helper', 'non_interaction': false});
}

function start() {
    var englishText = document.getElementById('english-text');
    var translationInfoEle = document.getElementById('translation-info');
    var translationInfoString = translationInfoEle.value;
    var storyBodyEle = document.getElementById('story-body-container');
    if (translationInfoString !== '') {
        var translationInfo = JSON.parse(translationInfoString);
        var englishEle = document.createElement('DIV');
        englishEle.innerHTML = englishText.value;
        var k = '';
        if (window.opener && window.opener.titles) {
            for (var j=0; j<window.opener.titles.length; j++) {
                var info = window.opener.titles[j];
                var infoHTML = '<div class="info-original">' + info.original + '</div>';
                var id = info.id;
                var translations = info.translations.split(splitter);
                for (var m=0; m<translations.length; m++) {
                    infoHTML += '<div onclick="confirmTranslation(this)" data-translation-index="' + m + '"  class="info-translation" title="click to confirm this translation to the right">' + translations[m] + '</div>';
                }
                infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><textarea data-info-id="' + id + '" placeholder="点选右边的翻译版本，您也可以继续编辑"></textarea></div></div><hr>';
                k += infoHTML;
            }
        }
        for (var i=0; i<translationInfo.length; i++) {
            var info = translationInfo[i];
            var infoHTML = '';
            var id = info.id;
            var englishHTML = englishEle.querySelector('#' + id).innerHTML;
            infoHTML += '<div class="info-original">' + englishHTML + '</div>';
            for (var j=0; j<info.translations.length; j++) {
                var translation = info.translations[j];
                var t = (/<.+>/g.test(translation)) ? tidyHTML(translation) : translation;
                infoHTML += '<div onclick="confirmTranslation(this)" data-translation-index="' + j + '" class="info-translation" title="click to confirm this translation to the right">' + t + '</div>';
            }
            infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><textarea data-info-id="' + id + '" placeholder="点选右边的翻译版本，您也可以继续编辑"></textarea></div></div><hr>';
            k += infoHTML;
        }
        k += '<div class="centerButton"><input type="button" value="完成并关闭" onclick="finishTranslation()" class="submitbutton button ui-light-btn"></div>';
        storyBodyEle.innerHTML = k;
        document.querySelector('.body').classList.add('full-grid');
    } else {
        var englishTextArray = convertTextToArray(englishText.value);
        var translationEles = document.querySelectorAll('.chinese-translation');
        var translationsArray = [];
        for (var i=0; i<translationEles.length; i++) {
            var translationText = translationEles[i].value;
            translationsArray.push(convertTextToArray(translationText));
        }
        var p = '';
        for (var j=0; j<englishTextArray.length; j++) {
            p += '<div>' + englishTextArray[j] + '</div>';
            for (var k=0; k<translationsArray.length; k++) {
                var currentTranslationArray = translationsArray[k];
                if (currentTranslationArray[j]) {
                    p += '<div onclick="addTranslation(this)" data-translation-index="' + k + '" class="chinese-translation" title="click to add this translation to the right">' + currentTranslationArray[j] + '</div>';
                }
            }
            p += '<hr>';

        }
        storyBodyEle.innerHTML = p;
    }
    englishText.style.display = 'none';
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('translations').style.display = 'none';
    translationInfoEle.style.display = 'none';
    document.querySelector('.sidebar').style.display = 'grid';
    // MARK: - If all three translations are the same, select directly
    var containers = document.querySelectorAll('.info-container')
    for (var m=0; m<containers.length; m++) {
        var container = containers[m];
        var translations = new Set();
        var translationEles = container.querySelectorAll('.info-translation')
        for (var n=0; n<translationEles.length; n++) {
            var translation = translationEles[n];
            translations.add(translation.innerHTML);
        }
        if (translations.size !== 1) {continue;}
        var value = translationEles[0].innerHTML;
        container.querySelector('textarea').value = value;
        container.querySelector('.info-translation').classList.add('selected');
    }
}

function trackFinishTimeAndClose() {
    var finishTime = new Date();
    var spentTime = Math.round(finishTime.getTime() - startTime.getTime());
    gtag('event', 'timing_complete', {
        'name' : 'finish',
        'value' : spentTime,
        'event_category' : "Quick Translation",
        'event_callback': function() {
            console.log('Spent ' + spentTime + ' miliseconds! ');
            if (window.opener) {window.close();}
        }
    });
    setTimeout(function(){
        if(window.opener) {window.close();}
    }, 3000);
}

function finish() {
    console.log ('paste the chinese text back! ');
    if (window.opener) {
        var result = document.getElementById('final-translation').value;
        window.opener.document.getElementById('cbody').value = result;
        window.opener.document.getElementById('tag').value += ',translation_confirmed';
    }
    trackFinishTimeAndClose();
}

function getCleanText(ele) {
    var cleanTexts = [];
    for (var i=0; i<ele.children.length; i++) {
        var child = ele.children[i];
        if (child.tagName.toUpperCase() === 'P') {
            cleanTexts.push(child.innerHTML);
        } else {
            cleanTexts.push(child.outerHTML);
        }
    }
    return cleanTexts.join('\n\n');
}

function formatDuration(seconds) {
    if (seconds === 0) {return 'now';}
    var formats = [
        {name: 'second', up: 60},
        {name: 'minute', up: 60},
        {name: 'hour', up: 24},
        {name: 'day', up: 365},
        {name: 'year'}
    ]
    var v = seconds;
    var times = [];
    for (var i=0; i<formats.length; i++) {
        var up = formats[i].up;
        var name = formats[i].name;
        var value = (up) ? v % up : v;
        if (value>0) {
            var suffix = (value>1) ? 's' : '';
            times.push(value + ' ' + name + suffix);
        }
        v = Math.floor(v/up);
        if (v === 0) {break;}
    }
    times = times.reverse();
    result = times.join(', ').replace(/, ([^,]+)$/, ' and $1');
    return result;
}

function finishTranslation() {
    if (typeof window.subtitleInfo === 'object') {
        finishTranslationForVideo();
    } else {
        finishTranslationForArticle();
    }
    trackFinishTimeAndClose();
}

function finishTranslationForArticle() {
    var t = document.getElementById('english-text').value;
    var newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
    var englishInfoDiv = document.createElement('DIV');
    englishInfoDiv.innerHTML = newText;
    var cleanEnglishText = getCleanText(englishInfoDiv);
    var titles = ['cheadline', 'clongleadbody'];
    var titlesInfo = [];
    for (var i=0; i<document.querySelectorAll('[data-info-id]').length; i++) {
        var ele = document.querySelectorAll('[data-info-id]')[i];
        var id = ele.getAttribute('data-info-id');
        var infoEle = englishInfoDiv.querySelector('#' + id);
        if (infoEle) {
            infoEle.innerHTML = ele.value.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
        }
        for (var m=0; m<titles.length; m++) {
            if (titles[m] === id) {
                console.log(ele);
                titlesInfo.push({id: id, value: ele.value});
            }
        }
    }
    var cleanChineseText = getCleanText(englishInfoDiv);
    if (window.opener) {
        var cbodyEles = window.opener.document.querySelectorAll('textarea.bodybox, #cbody');
        for (var j=0; j<cbodyEles.length; j++) {
            var cbodyEle = cbodyEles[j];
            cbodyEle.disabled = false;
            cbodyEle.value = cleanChineseText;
        }
        ebodyEle = window.opener.document.getElementById('ebody');
        ebodyEle.disabled = false;
        ebodyEle.value = cleanEnglishText;
        for (var k=0; k<titlesInfo.length; k++) {
            var id = titlesInfo[k].id;
            var value = titlesInfo[k].value;
            window.opener.document.getElementById(id).disabled = false;
            window.opener.document.getElementById(id).value = value;
        }
        var translationHelperButton = window.opener.document.querySelector('.translation-helper');
        if (translationHelperButton) {
            var finishTime = new Date();
            var spentTime = Math.round((finishTime.getTime() - startTime.getTime())/1000);
            translationHelperButton.innerHTML = 'Translation finished in ' + formatDuration(spentTime) + '. ';
            setTimeout(function(){translationHelperButton.style.display = 'none';}, 6000);
        }
        // MARK: - In the workflow, there's a weird requirement that a translator have to use a select menu to indicate that the translation is finished. This is totally stupid so I'll just automate it. 
        var completeSelects = window.opener.document.querySelectorAll('select');
        for (var l=0; l<completeSelects.length; l++) {
            currentSelect = completeSelects[l];
            if (currentSelect.id && currentSelect.id.indexOf('complete_') === 0) {
                currentSelect.value = 1;
            }
        }
    }
}

function finishTranslationForVideo() {
    var infos = window.subtitleInfo.text;
    for (var p of infos) {
        for (var s of p) {
            const id = s.id;
            const translation = document.querySelector(`[data-info-id="${id}"]`).value;
            s.translation = translation;
            delete s.translations;
            delete s.id;
        }
    }
    if (window.opener) {
        var cbodyEle = window.opener.document.querySelector('#cbody');
        if (cbodyEle) {
            cbodyEle.value = JSON.stringify(window.subtitleInfo);
        }
    } else {
        console.log(window.subtitleInfo);
    }
}

window.subtitleInfo = {"url":"https://creatives.ftacademy.cn/album/7ba6423a-9952-480a-8dc9-a70c537bff34.mp3","caption":"https://next-media-api.ft.com/captions/16108032622160.vtt","imageUrl":"http://com.ft.imagepublish.upp-prod-us.s3.amazonaws.com/02cc1a88-8f00-4bcb-835c-496df5b06036","video":"https://next-media-api.ft.com/renditions/16108032622160/640x360.mp4","text":[[{"start":6.42,"end":9.78,"text":"Britain is not alone in the fight against Covid-19, ","translations":["在对抗Covid-19的斗争中，英国并不孤单，但是对于那些希望摆脱封锁的人来说，这是一个有趣的案例研究。","英国并不是唯一一个与Covid-19作斗争的国家，但对于那些希望摆脱封锁的国家来说，它是一个有趣的案例研究。","在抗击新冠肺炎的斗争中，英国并非孤军奋战，但对于那些希望逃离封锁的人来说，这是一个有趣的案例研究。"]},{"start":9.78,"end":11.85,"text":"but it is an interesting case study for those "},{"start":11.85,"end":14.13,"text":"looking to escape lockdown. "}],[{"start":14.13,"end":17.25,"text":"On the one hand, one of the most advanced vaccine programmes ","translations":["一方面，这是世界上最先进的疫苗计划之一。","一方面，世界上最先进的疫苗计划之一。","一方面，世界上最先进的疫苗项目之一。"]},{"start":17.25,"end":18.33,"text":"in the world. "}],[{"start":18.33,"end":21.15,"text":"On the other, a new variant of coronavirus that's ","translations":["另一方面，冠状病毒的新变种正在以创纪录的数量感染人口。","另一方面，一种新的冠状病毒变种，正在以创纪录的数量感染人口。","另一方面，一种新型冠状病毒正在以创纪录的数量感染人群。"]},{"start":21.15,"end":24.57,"text":"infecting the population in record numbers. "}],[{"start":24.57,"end":27,"text":"Hopes now lie with the UK government's pledge ","translations":["现在，人们寄希望于英国政府承诺到2月中旬向1500万最脆弱的英国人提供疫苗。","现在的希望在于英国政府承诺在2月中旬前为1500万最脆弱的英国人提供疫苗。","希望寄托在英国政府的承诺上，即在2月中旬之前为1500万最脆弱的英国人提供疫苗。"]},{"start":27,"end":30.78,"text":"to offer a vaccine to 15m of the most vulnerable Britons "},{"start":30.78,"end":33.15,"text":"by the middle of February. "}],[{"start":33.15,"end":36.51,"text":"88 per cent of people currently dying from the virus ","translations":["目前死于该病毒的人中有88％来自这些群体。","目前死于病毒的88%的人来自这些群体。","目前死于该病毒的人中有88%来自这些群体。"]},{"start":36.51,"end":38.93,"text":"come from these groups. "}],[{"start":38.93,"end":42.18,"text":"With them protected it's thought that the rest of the population ","translations":["有了他们的保护，人们认为其他人民应该能够享有更多的自由，而不会给医疗服务施加太大的压力。","有了他们的保护，想必其他人群应该可以享受更多的自由，而不会给医疗服务带来太大的压力。","有了他们的保护，其他人应该能够享受更多的自由，而不会让医疗服务承受太多压力。"]},{"start":42.18,"end":45.06,"text":"should be able to enjoy more freedom without putting "},{"start":45.06,"end":48.15,"text":"the health services under too much strain. "}],[{"start":48.15,"end":51.69,"text":"That moment may come after the February half-term, ","translations":["尽管我们应该对未来的时间表保持极为谨慎的态度，但这一时刻可能会在2月的半年期之后。","这个时刻可能会在2月半期之后到来，尽管我们应该对未来的时间表保持极为谨慎的态度。","这个时刻可能会在2月的期中之后到来，尽管我们应该对未来的时间表保持极其谨慎的态度。"]},{"start":51.69,"end":53.19,"text":"although we should remain extremely "},{"start":53.19,"end":56.885,"text":"cautious about the timetable ahead. "}],[{"start":56.885,"end":59.37,"text":"But whether the vaccination target will be met ","translations":["但是，是否可以达到疫苗接种目标以及是否足以结束锁定目标是两个截然不同的问题。","但是，能否实现疫苗接种目标和是否足以结束封锁是两个截然不同的问题。","但疫苗接种目标能否实现，以及是否足以结束封锁是两个截然不同的问题。"]},{"start":59.37,"end":61.83,"text":"and whether it will be enough to end lockdown "},{"start":61.83,"end":64.17,"text":"are two very different questions. "}],[{"start":64.17,"end":67.29,"text":"And a lot could happen between now and mid-February that would ","translations":["从现在到2月中旬可能发生很多事情，这将改变两者的结果。","而从现在到2月中旬之间可能会发生很多事情，从而改变这两个问题的结果。","从现在到2月中旬，可能会发生很多事情，从而改变双方的结果。"]},{"start":67.29,"end":69.45,"text":"change the outcome of both. "}],[{"start":69.45,"end":70.64,"text":"Here's what to look out for. ","translations":["这是要注意的地方。","以下是需要注意的问题。","以下是需要注意的事项。"]}],[{"start":77.34,"end":81.93,"text":"If the UK wants to vaccinate 15m people by mid-February it will ","translations":["如果英国想在2月中旬之前给1500万人接种疫苗，那么在接下来的5周中，英国必须每周注射250万剂疫苗。","如果英国想要在2月中旬之前为1500万人接种疫苗，那么在接下来的五周内，它必须每周接种250万剂疫苗。","如果英国想在2月中旬之前为1500万人接种疫苗，那么在接下来的5周内，它必须每周注射250万剂疫苗。"]},{"start":81.93,"end":86.64,"text":"have to administer 2.5m doses per week for the next five "},{"start":86.64,"end":87.66,"text":"weeks. "}],[{"start":87.66,"end":92.19,"text":"At the moment, that figure is closer to 2.1m per week. ","translations":["目前，这个数字接近每周210万。","目前，这个数字接近于每周210万支。","目前，这一数字接近每周210万。"]}],[{"start":92.19,"end":94.86,"text":"And Britain's health secretary has suggested delays ","translations":["英国卫生部长建议扩大规模的延误归结为疫苗供应有限。","而英国卫生大臣表示，推迟扩大规模是由于疫苗供应有限。","英国卫生大臣表示，推迟扩大疫苗供应的原因是疫苗供应有限。"]},{"start":94.86,"end":99.345,"text":"in scaling that up are down to the limited supply of vaccines. "}],[{"start":99.345,"end":102.18,"text":"The rate limiting step is the supply of vaccine. ","translations":["限速步骤是疫苗的供应。","限制速度的步骤是疫苗的供应。","限制速度的步骤是疫苗的供应。"]}],[{"start":102.18,"end":103.92,"text":"And we're working with the companies ","translations":["我们正在与公司合作以增加供应。","我们正在与公司合作以增加供应。","我们正在与这些公司合作增加供应。"]},{"start":103.92,"end":106.755,"text":"to increase the supply. "}],[{"start":106.755,"end":110.28999999999999,"text":"It's true that manufacturing is still getting up to speed. ","translations":["的确，制造业仍在加速发展。","诚然，生产制造的速度还在加快。","的确，制造业仍在加速发展。"]}],[{"start":110.28999999999999,"end":112.59,"text":"And there are even shortages of the glass vials ","translations":["而且甚至没有一批玻璃瓶被运送进来。","甚至出现了批量运输的玻璃瓶短缺的情况。","而且，运输这些批次的玻璃瓶也出现了短缺。"]},{"start":112.59,"end":114.72,"text":"that batches are transported in. "}],[{"start":114.72,"end":117.53999999999999,"text":"But bringing enough vaccination sites on stream ","translations":["但是，要提供足够的疫苗接种地点并雇用足够的人来管理它们，这也带来了挑战。","但是，如何将足够的疫苗接种点投入使用，并雇佣足够的人员进行管理，也是一个挑战。","但是，让足够多的疫苗接种点投入生产并雇佣足够多的人来接种疫苗也面临着挑战。"]},{"start":117.53999999999999,"end":119.78999999999999,"text":"and hiring enough people to man them "},{"start":119.78999999999999,"end":122.31,"text":"is also presenting challenges. "}],[{"start":122.31,"end":126.75,"text":"The government has set up plans for 2,700 vaccination centres, ","translations":["政府已经为2700个疫苗接种中心制定了计划，包括医院，医生手术室，药房和最多15个大规模疫苗接种场所。","政府已经制定了2700个疫苗接种中心的计划，包括医院、医生手术室、药店以及多达15个大规模疫苗接种点。","政府已经为2700个疫苗接种中心制定了计划，包括医院、外科医生、药房和多达15个大规模疫苗接种点。"]},{"start":126.75,"end":130.62,"text":"including hospitals, doctor surgeries, pharmacies, and up "},{"start":130.62,"end":133.77,"text":"to 15 mass vaccination sites. "}],[{"start":133.77,"end":137.67000000000002,"text":"At the same time the NHS has hired 80,000 professionals ","translations":["同时，NHS雇用了80,000名专业人员来开展竞选活动。","同时，国家医疗服务体系已经聘请了8万名专业人员来开展这项运动。","与此同时，NHS聘请了8万名专业人士来开展这项活动。"]},{"start":137.67000000000002,"end":139.32,"text":"to run the campaign. "}],[{"start":139.32,"end":142.11,"text":"But frustrations have mounted about how quickly the programme ","translations":["但是，对于该计划的建立速度感到沮丧，决策者已经在寻找其他加快采用该计划的方法。","但是，人们对该计划的建立速度感到沮丧，政策制定者已经在寻找其他方法来加速吸收。","但人们对该计划的建立速度感到越来越失望，政策制定者已经在寻找其他方式加速实施。"]},{"start":142.11,"end":144.72,"text":"is being set up, and policymakers are already "},{"start":144.72,"end":147.04500000000002,"text":"looking at other ways to accelerate uptake. "}],[{"start":155.32,"end":158.74,"text":"Right now, Israel is head and shoulders above other countries ","translations":["目前，在人均疫苗接种方面，以色列领先于其他国家/地区，这在一定程度上要归功于高度集中化的数字卫生系统，该系统使与公众的接触和签约变得容易。","目前，以色列的人均疫苗接种率高于其他国家，这部分得益于高度集中的数字卫生系统，该系统可以方便地接触到公众，并为他们报名接种疫苗。","目前，以色列的人均疫苗接种数量远远超过其他国家，这部分归功于高度集中的数字医疗系统，它可以很容易地接触到公众，并为他们登记注射疫苗。"]},{"start":158.74,"end":161.29,"text":"when it comes to vaccinations per capita, "},{"start":161.29,"end":163.39,"text":"thanks in part to a highly centralised, "},{"start":163.39,"end":165.46,"text":"digital health system that makes it "},{"start":165.46,"end":167.62,"text":"easy to reach out to members of the public "},{"start":167.62,"end":170.2,"text":"and sign them up for a jab. "}],[{"start":170.2,"end":172.32999999999998,"text":"Britain has started to follow this lead ","translations":["英国已经开始通过发出中央政府的预防接种信来效仿这种做法。","英国已经开始效仿这一做法，由中央政府发送疫苗接种信。","英国已经开始效仿这一做法，由中央政府发出疫苗接种信。"]},{"start":172.32999999999998,"end":174.25,"text":"by sending out vaccination letters "},{"start":174.25,"end":176.02,"text":"from central government. "}],[{"start":176.02,"end":178.57,"text":"And in another attempt to speed things along, ","translations":["为了加快步伐，威斯敏斯特扩大了第一剂和第二剂之间的差距，尽管该策略受到了批评。","而在另一个试图加快进展的过程中，威斯敏斯特已经延长了第一剂和第二剂之间的差距，尽管这种策略有其批评者。","在另一个加快进程的尝试中，威斯敏斯特扩大了第一剂和第二剂之间的差距，尽管这一策略遭到了批评。"]},{"start":178.57,"end":182.83,"text":"Westminster has extended the gap between first and second doses, "},{"start":182.83,"end":185.065,"text":"although that strategy has its critics. "}],[{"start":193.39,"end":196.9,"text":"When Pfizer and BioNTech and Oxford AstraZeneca ","translations":["辉瑞公司和BioNTech公司以及牛津阿斯利康公司完成临床试验后，他们建议第一剂和第二剂之间应间隔三周。","当辉瑞和BioNTech以及牛津阿斯利康公司完成临床试验时，他们建议第一剂和第二剂之间有三周的间隔。","辉瑞、生物科技公司和阿斯利康公司完成临床试验后，建议第一次和第二次服用间隔三周。"]},{"start":196.9,"end":198.97,"text":"completed their clinical trials they "},{"start":198.97,"end":203.05,"text":"recommended a three-week gap between first and second doses. "}],[{"start":203.05,"end":205.75,"text":"But now a growing number of scientists, including ","translations":["但是现在，包括英国疫苗接种和免疫联合委员会以及牛津大学和阿斯利康大学的研究人员在内的越来越多的科学家建议将这一差距进一步扩大到长达12周。","但现在越来越多的科学家，包括英国疫苗接种和免疫联合委员会以及牛津大学和阿斯利康公司的研究人员，都建议将间隔时间推得更远，达到12周。","但现在，包括英国疫苗接种和免疫联合委员会(Joint Committee on vaccine and Immunisation)、牛津大学(Oxford)和阿斯利康(AstraZeneca)的研究人员在内，越来越多的科学家建议将这一差距扩大到12周。"]},{"start":205.75,"end":209.5,"text":"the UK'S Joint Committee on Vaccination and Immunisation "},{"start":209.5,"end":212.47,"text":"and researchers at Oxford and AstraZeneca, "},{"start":212.47,"end":215.05,"text":"are recommending that the gap gets pushed much further "},{"start":215.05,"end":217.615,"text":"out to up to 12 weeks. "}],[{"start":217.615,"end":219.64,"text":"By extending the gap, we are going to, ","translations":["通过扩大差距，我们将在未来三个月内使能够接种疫苗的人数实质上增加一倍。","通过扩大差距，我们将在接下来的三个月内，将能够使能够接种疫苗的人数增加一倍。","通过扩大这一差距，我们将在接下来的三个月里将接种疫苗的人数增加一倍。"]},{"start":219.64,"end":222.79,"text":"over the next three months be able to essentially double "},{"start":222.79,"end":224.92000000000002,"text":"the number of people who can be vaccinated. "}],[{"start":224.92000000000002,"end":227.32,"text":"Hospitalisations and deaths from Covid-19 ","translations":["目前，Covid-19的住院和死亡人数是有史以来最高的。","因Covid-19而导致的住院和死亡人数目前是最高的。","Covid-19的住院和死亡人数目前处于有史以来的最高水平。"]},{"start":227.32,"end":229.99,"text":"are currently at the highest they've ever been. "}],[{"start":229.99,"end":232.57,"text":"With more people receiving the limited protection offered ","translations":["随着越来越多的人更快地获得首剂所提供的有限保护，逻辑上是该策略可能减轻英国过度紧张的医疗服务的压力。","随着更多的人更快地接受第一剂疫苗所提供的有限保护，这种策略的逻辑是，可以减轻英国过度紧张的医疗服务的压力。","随着更多的人更快地接受第一剂药物提供的有限保护，这一策略的逻辑是可以减轻英国超负荷的医疗服务的压力。"]},{"start":232.57,"end":235.03,"text":"by the first dose quicker, the logic "},{"start":235.03,"end":236.89,"text":"is this strategy could take pressure "},{"start":236.89,"end":239.92000000000002,"text":"off Britain's overstretched health service. "}],[{"start":239.92000000000002,"end":242.71,"text":"And that, in turn, could offer a quicker path ","translations":["反过来，这也可以为放松限制提供一条更快的途径。","而这，又可以为放松限制提供一条更快的途径。","反过来，这可能会为放宽限制提供一条更快的途径。"]},{"start":242.71,"end":245.63,"text":"to easing restrictions. "}],[{"start":245.63,"end":248.75,"text":"Even though some scientists are confident that extending ","translations":["即使有些科学家有信心扩大剂量之间的差距不会降低疫苗的有效性，但另一些科学家不确定是否有足够的证据证明单剂量可以赋予多少免疫力。","即使一些科学家有信心，延长剂量之间的差距不会使疫苗的有效性降低，其他人不确定有足够的证据关于多少免疫力的单一剂量赋予。","尽管一些科学家相信，延长剂量之间的差距不会降低疫苗的有效性，但其他人不确定是否有足够的证据表明，一剂疫苗能带来多少免疫力。"]},{"start":248.75,"end":252.77,"text":"the gap between doses won't make the vaccine any less effective, "},{"start":252.77,"end":255.47,"text":"others aren't sure there's enough evidence about how much "},{"start":255.47,"end":258.05,"text":"immunity a single dose confers. "}],[{"start":258.05,"end":260.51,"text":"They've also warned that partially boosting ","translations":["他们还警告说，部分增强免疫系统会为病毒变异和增强抵抗力创造机会。","他们还警告说，部分提升免疫系统可能为病毒变异和变得更有抵抗力创造机会。","他们还警告说，部分增强免疫系统可能会使病毒发生变异，变得更有抵抗力。"]},{"start":260.51,"end":263.99,"text":"the immune system could create an opportunity for the virus "},{"start":263.99,"end":267.62,"text":"to mutate and become more resistant. "}],[{"start":267.62,"end":271.34,"text":"If that happens, all hopes of a swift exit from the crisis ","translations":["如果发生这种情况，所有希望迅速摆脱危机的希望都将破灭。","如果发生这种情况，所有迅速摆脱危机的希望都将破灭。","如果出现这种情况，所有迅速摆脱危机的希望都将破灭。"]},{"start":271.34,"end":273.02,"text":"will be dashed. "}],[{"start":273.02,"end":275.39,"text":"Thankfully, at the moment, there isn't evidence ","translations":["值得庆幸的是，目前还没有证据表明这有可能发生。","值得庆幸的是，目前还没有证据表明这种情况有可能发生。","值得庆幸的是，目前还没有证据表明这种情况可能会发生。"]},{"start":275.39,"end":276.78,"text":"that this is likely to happen. "}],[{"start":284.9,"end":287.2,"text":"The current UK lockdown is in large part ","translations":["当前的英国锁定很大程度上是由于伦敦和肯特出现了一个名为B117的新变种。","目前英国的封锁很大程度上是由于伦敦和肯特郡出现了一种名为B117的新变种。","英国目前的封锁很大程度上是由于伦敦和肯特出现了一种名为B117的新变种。"]},{"start":287.2,"end":289.18,"text":"due to a new variant that emerged "},{"start":289.18,"end":292.57,"text":"in London and Kent called B117. "}],[{"start":292.57,"end":295.27,"text":"Early research suggests that neither this variant, ","translations":["早期研究表明，这种变种或起源于南非的变种都不可能对当前的疫苗产生更大的抵抗力。","早期的研究表明，无论是这种变异体，还是源自南非的变异体，都不可能对当前的疫苗作物产生更强的抗性。","早期的研究表明，无论是这种变种，还是源自南非的变种，都不太可能对目前的疫苗更有抗性。"]},{"start":295.27,"end":297.7,"text":"nor one originating in South Africa, "},{"start":297.7,"end":300.13,"text":"are likely to be more resistant to the current crop "},{"start":300.13,"end":301.48,"text":"of vaccines. "}],[{"start":301.48,"end":304.03,"text":"But experts have warned that we should ","translations":["但是专家警告说，随着病毒适应其新的人类宿主，今年我们应该为更多的变种做好准备。","但专家警告说，我们应该做好准备，随着病毒适应新的人类宿主，今年会出现比去年更多的变种。","但专家警告称，随着病毒适应新的人类宿主，我们应该为今年出现更多变种做好准备。"]},{"start":304.03,"end":306.07,"text":"be prepared for many more variants "},{"start":306.07,"end":309.34,"text":"to emerge this year than last as the virus adapts "},{"start":309.34,"end":311.74,"text":"to its new human host. "}],[{"start":311.74,"end":315.67,"text":"If new variants evade both natural and vaccine-induced ","translations":["如果新的变种规避了自然免疫和疫苗诱导的免疫反应，则可以对疫苗进行调整以赶上。","如果新的变种能够躲过自然和疫苗诱导的免疫反应，那么疫苗就可以进行调整以赶上。","如果新的变种逃避了自然的和疫苗诱导的免疫反应，疫苗可以调整来赶上。"]},{"start":315.67,"end":320.35,"text":"immune responses the vaccines can be tweaked to catch up. "}],[{"start":320.35,"end":323.65,"text":"But analysts say this could take anywhere between one and nine ","translations":["但分析师表示，这可能需要一到九个月的时间，具体取决于监管机构的要求。","但分析人士表示，这可能需要1至9个月的时间，这取决于监管机构的要求。","但分析师表示，这可能需要1至9个月的时间，具体时间取决于监管机构的要求。"]},{"start":323.65,"end":326.05,"text":"months, depending on what regulators demand. "}],[{"start":333.02,"end":336.92,"text":"The race between vaccines and the virus has a long way to go. ","translations":["疫苗和病毒之间的竞争还有很长的路要走。","疫苗和病毒之间的竞赛还有很长的路要走。","疫苗和病毒之间的竞争还有很长的路要走。"]}],[{"start":336.92,"end":339.32,"text":"But the new variants that popped up last year ","translations":["但是去年出现的新变种使Covid-19抢先了。","但去年出现的新变种已经让科威-19占得先机。","但去年出现的新变种让Covid-19领先一步。"]},{"start":339.32,"end":342.74,"text":"have given Covid-19 a head start. "}],[{"start":342.74,"end":345.02,"text":"Whether the UK hits its vaccination target ","translations":["英国是否要在2月中旬之前达到1500万人的疫苗接种目标非常重要，但不仅仅是为了放松对英国的锁定。","英国是否能在2月中旬达到1500万人的疫苗接种目标是非常重要的，但不仅仅是为了缓解这里的封锁。","英国能否在2月中旬之前达到1500万人接种疫苗的目标非常重要，但这不仅仅是为了缓解这里的封锁。"]},{"start":345.02,"end":348.99,"text":"of 15m people by mid-February is hugely important "},{"start":348.99,"end":352.13,"text":"but not just for the sake of easing the lockdown here. "}],[{"start":352.13,"end":355.1,"text":"If vaccines don't catch up with the virus soon, ","translations":["如果疫苗不能很快赶上该病毒，那么我们所有人都可能会发现自己又回到了第一个位置，并且即将推出一种新的变体。","如果疫苗不能很快赶上病毒，我们可能会发现自己又回到了原点，一个新的变种遥遥领先。","如果疫苗不能很快赶上病毒，我们可能会发现自己回到原点，一种新的变种遥遥领先。"]},{"start":355.1,"end":358.01,"text":"we could all find ourselves back on square one "},{"start":358.01,"end":361.62,"text":"with a new variant pulling far ahead. "}]]};

if (window.opener || typeof window.subtitleInfo === 'object') {
    var englishText;
    var translationText;
    if (window.opener) {
        englishText = window.opener.ebodyForTranslation || window.opener.document.getElementById('ebody').value;
        translationText = window.opener.cbodyForTranslation || window.opener.document.getElementById('cbody').value;
        if (/caption/.test(translationText) && /translations/.test(translationText) && /\"end\":/.test(translationText)) {
            window.subtitleInfo = JSON.parse(translationText);
        }
    }
    // MARK: - Update english and translation text for video subtitles
    if (typeof window.subtitleInfo === 'object') {
        var infos = window.subtitleInfo.text;
        var englishTexts = [];
        var translations = [];
        var n = 0;
        for (var p of infos) {
            for (var s of p) {
                const id = `id-${n}`;
                englishTexts.push(`<p id="${id}">${s.text}</p>`);
                const t = s.translations || [];
                translations.push({id: `${id}`, translations: t});
                s.id = id;
                n += 1;
            }
        }
        englishText = englishTexts.join('');
        translationText = JSON.stringify(translations);
    }
    document.getElementById('english-text').value = englishText;
    if (/translations/.test(translationText)) {
        document.getElementById('translation-info').value = translationText;
    } else {
        translations = translationText.split(splitter);
        var translationsHTML = '';
        for (var k=0; k<translations.length; k++) {
            translationsHTML += '<textarea class="commentTextArea chinese-translation" width="100%" rows="3">' + translations[k] + '</textarea>';
        }
        document.getElementById('translations').innerHTML = translationsHTML;
    }
    start();
}

/* jshint ignore:end */