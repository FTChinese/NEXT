// follow and unfollow topic

// click events
try {
    var eleFollow;
    delegate.on('click', '.myft-follow', function(){
        //alert (this.getAttribute('data-tag'));
        if(window.username === '' || window.username === null){
            document.getElementById('login-reason').innerHTML = '<b>请先登录再关注话题</b>';
            showOverlay('overlay-login');
        } else {
            if (this.className.indexOf(' pending')>=0) {
                return;
            } else {
                this.className += ' pending';
            }
            var cmd = (this.className.indexOf(' plus')>0)?1:0;
            var currentButtonText = this.innerHTML;
            var cmdStatus = 'pending';
            var xhr = new XMLHttpRequest();
            var ajaxMethod;
            var ajaxUrl;
            var message = {};
            message.head = {};
            message.head.transactiontype = '31003';
            message.head.source = 'web';
            message.body = {};
            message.body.ielement = {};
            message.body.ielement.type = this.getAttribute('data-type');
            message.body.ielement.value = this.getAttribute('data-tag');
            message.body.ielement.cmd = cmd;
            if (/127\.0|localhost|192\.168/.test(window.location.href)) {
                ajaxMethod = 'GET';
                ajaxUrl = '/api/page/recommend.json';
            } else {
                ajaxMethod = 'POST';
                ajaxUrl = '/eaclient/apijson.php';
            }
            this.innerHTML = (this.className.indexOf(' plus')>0)?'关注...':'取消关注...';
            eleFollow = this;
            xhr.open(ajaxMethod, encodeURI(ajaxUrl));
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                try {
                    if (xhr.status === 200) {
                        var data = JSON.parse(xhr.responseText);
                        if (data.body.oelement.errorcode === '0') {
                            cmdStatus = 'success';
                        } else if (data.body.oelement.errorcode === '20101') {
                            cmdStatus = 'followed';
                        } else if (data.body.oelement.errorcode === '20100') {
                            cmdStatus = 'unfollowed';
                        } else {
                            cmdStatus = 'failed';
                        }
                    } else if (xhr.status !== 200) {
                        this.innerHTML = '操作失败';
                        cmdStatus = 'failed';
                        //alert('Request failed.  Returned status of ' + xhr.status);
                    }
                } catch(ignore) {
                    cmdStatus = 'failed';
                }
                //alert (eleFollow.innerHTML);
                if (cmdStatus === 'success') {
                    if (cmd === 1) {
                        eleFollow.innerHTML = '已关注';
                        eleFollow.className = eleFollow.className.replace(' plus', ' tick');
                    } else {
                        eleFollow.innerHTML = '关注';
                        eleFollow.className = eleFollow.className.replace(' tick', ' plus');
                    }
                } else if (cmdStatus === 'followed') {
                    eleFollow.innerHTML = '已关注';
                    eleFollow.className = eleFollow.className.replace(' plus', ' tick');
                } else if (cmdStatus === 'unfollowed') {
                    eleFollow.innerHTML = '关注';
                    eleFollow.className = eleFollow.className.replace(' tick', ' plus');
                } else {
                    eleFollow.innerHTML = '操作失败';
                    setTimeout(function(){
                        eleFollow.innerHTML = currentButtonText;
                    },1000);
                }
                eleFollow.className = eleFollow.className.replace(/ pending/g, '');
            };
            xhr.send(JSON.stringify(message));
        }
    });
} catch (ignore) {

}

function contains(a, obj) {
    if (a && a.length>0 && obj && obj.value && obj.tag) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].value === obj.value && a[i].tag === obj.tag) {
                // console.log ('yes:');
                // console.log (a[i]);
                // console.log (obj);
                return true;
            } else {
                // console.log ('no:');
                // console.log (a[i]);
                // console.log (obj);
            }
        }
    }
    return false;
}

function checkFollow() {
    var xhr = new XMLHttpRequest();
    var ajaxMethod;
    var ajaxUrl;
    var message = {};
    message.head = {};
    message.head.transactiontype = '31004';
    message.head.source = 'web';
    message.body = {};
    message.body.ielement = {};
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
            //console.log (data);
            var followButtons = document.querySelectorAll('button.myft-follow');
            for (var i=0; i < followButtons.length; i++) {
                var thisObj = {};
                thisObj.type = followButtons[i].getAttribute('data-type');
                thisObj.value = followButtons[i].getAttribute('data-tag');
                if (contains(data.body.odatalist, thisObj) === true) {
                    followButtons[i].innerHTML = '已关注';
                    followButtons[i].className = followButtons[i].className.replace(/ plus/g, ' tick');
                }
            }
        }
    };
    xhr.send(JSON.stringify(message));
}

checkFollow();

/*
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
                document.getElementById('story-recommend').innerHTML = itemHTML;
                document.getElementById('story-recommend-container').style.display = 'block';
                loadImages();
        	}
        }
    } else if (xhr.status !== 200) {
        //alert('Request failed.  Returned status of ' + xhr.status);
    }
};
xhr.send(JSON.stringify(message));
*/