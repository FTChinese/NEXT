var parentIframe;
function findTop(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
      do {
        curtop += obj.offsetTop;
      } while ((obj = obj.offsetParent));
      return curtop;
    }
}
    
var adContainerHeight;
var adBottom = document.getElementById('ad-bottom');
var adHeight = findTop(adBottom);
var adResized = false;
var adFullWidth = false;
var w=0;
    
if (window.parent.document.getElementById(window.parentId)) {
    parentIframe = window.parent.document.getElementById(window.parentId);
    adContainerHeight = parentIframe.offsetHeight || 0;



    // force the ad position to have a custom background
    if (typeof window.forceBG === 'string' && window.forceBG !== '') {
        document.body.style.backgroundColor = window.forceBG;
        if (parentIframe.parentNode.className.indexOf('banner-content')>=0) {
            parentIframe.parentNode.style.backgroundColor = window.forceBG;
        }
    }
    if (window.forceHeight && window.forceWidth) {
        adFullWidth = true;
        parentIframe.style.margin = 0;
        parentIframe.style.width = window.forceWidth + 'px';
        parentIframe.style.height = window.forceHeight + 'px';
        parentIframe.parentNode.style.height = window.forceHeight + 'px';
        parentIframe.parentNode.parentNode.parentNode.parentNode.className += ' standard';
    } else if (adHeight >= 120 && adHeight - adContainerHeight > 20) {
        //MARK:当自定义广告告度adHeight大于等于120，都会执行此分支，该分支会1.设置adResized为true 2.将广告的iframe(就是引入a.html的那个）的宽度设为1200。然后当adResized为true时，后面iframe的高度会重设为adHeight
        adResized = true;
        try {
            w = window.parent.innerWidth || window.parent.document.documentElement.clientWidth || window.parent.document.body.clientWidth;
            w = w - 60 - 15;
            if (w>1200) {
                w = 1200;
            } else {
                adHeight = w * 120/1200;
            }
            document.querySelector('.ad').className += ' standard';
            parentIframe.style.width = w + 'px';
            //parentIframe.parentNode.style.height = '120px';
            parentIframe.parentNode.parentNode.parentNode.parentNode.className += ' standard';
            document.querySelector('.ad img').style.width = w+'px';
            document.querySelector('.ad img').style.height = adHeight+'px';
        } catch(ignore){

        }
    } else if (adHeight > 0 &&  adHeight - adContainerHeight > 20) {
        adResized = true;
    }
    if (adResized === true) {
        parentIframe.style.height = adHeight + 'px';
        try {
            if (w<=1200) {
                if (window.parentId.indexOf('mpu')>=0) {
                    //alert (paretId);
                    parentIframe.parentNode.style.height = 'auto';
                } else {
                    parentIframe.parentNode.style.height = adHeight + 'px';
                }
            }
            window.parent.stickyBottomPrepare();
        } catch (err) {
            setTimeout (function(){
                window.parent.stickyBottomPrepare();
            }, 3000);
        }
    } else if (adFullWidth === true) {
        try {
            window.parent.stickyBottomPrepare();
        } catch (ignore) {
            setTimeout (function(){
                window.parent.stickyBottomPrepare();
            }, 3000);
        }
    }

    // if there's need track viewability
    if (typeof viewable === 'object') {
        setTimeout(function() {
            if (typeof window.parent.viewablesInit === 'function') {
                viewable.top = findTop (parentIframe.parentNode);
                viewable.height = parentIframe.parentNode.offsetHeight;
                viewable.viewed = false;
                window.parent.viewables.push(viewable);
                window.parent.viewablesInit();
                window.parent.trackViewables();
                //console.log (window.parent.viewables);
            }
        }, 1000);
    }

}
    
if (window.parent && window.parentId !== '' && /^banner/.test(window.parentId) && typeof stickyHeight === 'number' && stickyHeight > 0) {
    if (typeof window.parent.stickyAds !== 'object') {
        window.parent.stickyAds = [];
    }
    window.parent.stickyAds.push({
        'BannerId': window.parentId,
        'stickyHeight': stickyHeight
    });
    try {
        window.parent.stickyAdsPrepare();
        window.parent.stickyBottomPrepare();
    } catch (ignore) {

    }
}

//in a iframe of h5 template
if (window.parent && typeof window.parent.mpuAds === 'object' && window.parentId !== '') {
    if (typeof parentIframe === 'object') {
        var parentContainer = parentIframe.parentNode;
        var overlayLink;
        var adUrl = '';

        if (document.querySelector('.ad a')) {
            adUrl = document.querySelector('.ad a').href || '';
        }

        if (adUrl !== '') {
            if (parentContainer.getElementsByTagName('a').length===0) {
                overlayLink = document.createElement('a');
                parentContainer.appendChild(overlayLink);
            } else {
                overlayLink = parentContainer.getElementsByTagName('a')[0];
            }
            parentContainer.style.position = 'relative';
            overlayLink.href = adUrl;
            overlayLink.style.position = 'absolute';
            overlayLink.style.width = '100%';
            overlayLink.style.height = '100%';
            overlayLink.style.display = 'block';
            overlayLink.style.top = 0;
            overlayLink.style.left = 0;
            overlayLink.target = '_blank';
        }
    }
}

if (parentIframe && window.hideAdSign && window.hideAdSign !== '') {
    var adClassName = parentIframe.parentNode.className;
    parentIframe.parentNode.className = adClassName + ' hide-sign';
}
    
/*    
    try {
        if (document.querySelector('.ad').innerHTML.indexOf('bsch.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=22920013&amp;PluID=56&amp;w=969&amp;h=90&amp;') > 0)
        {
            parent.window.gCanReplaceInstoryWithAd = true;
            parent.window.gReplacedInstroyWithAd = false;
            var sourceInfo = {
                adLink: 'http://clickc.admaster.com.cn/c/a96781,b2042301,c362,i0,m101,8a1,8b2,h',
                adTitle: '轩尼诗顶通'
            };
            window.parent.showTextImageForAd(sourceInfo);
        } else if (document.querySelector('.ad').innerHTML.indexOf('bsch.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=22956903&amp;PluID=56&amp;w=300&amp;h=600&amp;dlm=3&amp;ucm=true') > 0) {
            parent.window.gCanReplaceInstoryWithAd = true;
            parent.window.gReplacedInstroyWithAd = false;
            var sourceInfo = {
                adLink: 'http://clickc.admaster.com.cn/c/a96781,b2042302,c362,i0,m101,8a1,8b2,h',
                adTitle: '轩尼诗右侧'
            };
            window.parent.showTextImageForAd(sourceInfo);
        }
    } catch(ignore) {
    }
*/
