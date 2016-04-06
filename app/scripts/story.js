/* exported showOverlay*/
function showOverlay(overlayId) {
    document.getElementById(overlayId).className = 'overlay-container on';
}

function closeOverlay(overlayId) {
    document.getElementById(overlayId).className = 'overlay-container';
}

var fontOptionsEle;
var fs;
var xhr = new XMLHttpRequest();
var ajaxMethod;
var ajaxUrl;
var message = {};
message.head = {};
message.head.transactiontype = '61009';
message.head.source = 'web';
message.body = {};
message.body.ielement = {};
message.body.ielement.storyid = '';

if (/127\.0|localhost|192\.168/.test(window.location.href)) {
	ajaxMethod = 'GET';
	ajaxUrl = '/api/page/recommend.json';
} else {
	ajaxMethod = 'POST';
	ajaxUrl = '/eaclient/apijson.php';
}

xhr.open(ajaxMethod, encodeURI(ajaxUrl));
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
    if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        var maxItem = 8;
        var itemCount = 0;
        var itemHTML = '';
        if (data.body.oelement.errorcode === '0') {
        	if (data.body.odatalist && data.body.odatalist.length > 0) {
        		for (var i=0; i<data.body.odatalist.length; i++) {
        			var itemClass = 'XL3 L3 M6 S6 P12';
        			var itemHeadline = data.body.odatalist[i].cheadline;
        			var itemImage = data.body.odatalist[i].piclink;
        			var itemId = data.body.odatalist[i].storyid;
        			var itemTop = '';
        			var itemTopClass = 'PT';
        			if (itemCount % 4 === 0) {
        				itemTopClass += ' XLT LT';
        			}
        			if (itemCount % 2 === 0) {
        				itemTopClass += ' MT ST';
        			}
        			if (itemTopClass !== '' && itemCount >0) {
        				itemTop = '<div class="' + itemTopClass + '"></div>';
        			}

        			if (itemCount<maxItem && itemImage && itemImage !== '') {
	        			itemHTML += itemTop + '<div class="item-container ' + itemClass + ' has-image no-lead"><div class="item-inner"><h2 class="item-headline"><a target="_blank" href="/story/'+itemId+'?tcode=smartrecommend">'+itemHeadline+'</a></h2><a class="image" target="_blank" href="/story/'+itemId+'?tcode=smartrecommend"><figure class="loading" data-url="'+itemImage+'"></figure></a><div class="item-bottom"></div></div></div>';
	        			itemCount += 1;
        			}
        		}
        	}
        }
        document.getElementById('story-recommend').innerHTML = itemHTML;
        document.getElementById('story-recommend-container').style.display = 'block';
        loadImages();
    } else if (xhr.status !== 200) {
        //alert('Request failed.  Returned status of ' + xhr.status);
    }
};
xhr.send(JSON.stringify(message));

//click to close
delegate.on('click', '.overlay-close, .overlay-bg', function(){
    var parentId = this.getAttribute('data-parentid');
    closeOverlay(parentId);
});

//set font
fontOptionsEle = document.getElementById('font-options');
//click to change font size and set cookie (fs)
delegate.on('click', '#font-options div', function(){
    var currentClass = this.className || '';
    var selectedClass;
    if (currentClass.indexOf('selected') <0) {
        selectedClass = fontOptionsEle.querySelector('.selected').className;
        selectedClass = selectedClass.replace(/ selected/g, '');
        fontOptionsEle.querySelector('.selected').className = selectedClass;
        this.className = currentClass + ' selected';
        /* jshint ignore:start */
        SetCookie('fs',currentClass,'','/');
        /* jshint ignore:end */
        document.querySelector('.story-container').className = 'story-container ' + currentClass;
        stickyBottomPrepare();
        stickyAdsPrepare();
    }
});

//set font by getting user cookie (fs)
/* jshint ignore:start */
fs = GetCookie('fs');
/* jshint ignore:end */
if (typeof fs === 'string' && fs !== null && fs !== '') {
    document.getElementById('font-options').querySelector('.' + fs.replace(/ /g, '.')).className = fs + ' selected';
    document.querySelector('.story-container').className = 'story-container ' + fs;
} else {
    document.getElementById('font-setting').querySelector('.normal').className = 'normal selected';
}

//document.getElementById('font-options').querySelectorAll('div');

