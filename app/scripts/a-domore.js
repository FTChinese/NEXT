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
var w = 0;
var w1 = 0;

    
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
            w1 = window.innerWidth || window.documentElement.clientWidth || document.body.clientWidth;
            // MARK: If the ad frame width is less than 300px, it's not a banner
            if (w1 <= 300) {
                w = w1;
            } else if (w>1200) {
                w = 1200;
            } else {
                // MARK: Otherwise it's a banner
                adHeight = w * 120/1200;
            }

            document.querySelector('.ad').className += ' standard';
            parentIframe.style.width = w + 'px';
            //parentIframe.parentNode.style.height = '120px';
            parentIframe.parentNode.parentNode.parentNode.parentNode.className += ' standard';
            var adImgEle = document.querySelector('.ad img');
            if (adImgEle !== null) {
                adImgEle.style.width = w+'px';
                adImgEle.style.height = adHeight+'px';    
                var adImgContainer = document.getElementById('n-ad-container').querySelectorAll('div');
                if (adImgContainer.length > 0) {
                    adImgContainer[0].style.width = w+'px';
                    adImgContainer[0].style.height = adHeight + 'px';
                }           
            }

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
            try {
                window.parent.stickyBottomPrepare();
            } catch (ignore) {

            }
        } catch (err) {
            setTimeout (function(){
                try {
                    window.parent.stickyBottomPrepare();
                } catch (ignore) {
                    
                }
            }, 3000);
        }
    } else if (adFullWidth === true) {
        try {
            window.parent.stickyBottomPrepare();
        } catch (ignore) {
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

    

// try {
//     // if (document.querySelector('.ad').innerHTML.indexOf('bsch.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=22920013&amp;PluID=56&amp;w=969&amp;h=90&amp;') > 0)
//     // {
//     //     parent.window.gCanReplaceInstoryWithAd = true;
//     //     parent.window.gReplacedInstroyWithAd = false;
//     //     var sourceInfo = {
//     //         adLink: 'https://bsch.serving-sys.com/BurstingPipe/adServer.bs?cn=brd&Page=www.ftchinese.com&PluID=56&Pos=5101190044725428&EyeblasterID=53873120&clk=1&sct=1&dg=16449088&dgo=10843710&di=0&pc=&sessionid=1759035421168368094&usercookie=u2=043f732d-40ca-4c03-978e-c74f2beea59b&OptOut=0&rtu=http%3A%2F%2Fclickc.admaster.com.cn%2Fc%2Fa111523%2Cb2738347%2Cc362%2Ci0%2Cm101%2C8a1%2C8b2%2Ch&ebReferrer=http%3A%2F%2Fwww.ftchinese.com%2F',
//     //         adTitle: '轩尼诗顶通'
//     //     };
//     //     window.parent.showTextImageForAd(sourceInfo);
//     // } else 
//     if (document.querySelector('.ad').innerHTML.indexOf('25600715') > 0) {
//         parent.window.gCanReplaceInstoryWithAd = true;
//         parent.window.gReplacedInstroyWithAd = false;
//         var sourceInfo = {
//             adLink: 'https://bsch.serving-sys.com/BurstingPipe/adServer.bs?cn=brd&Page=www.ftchinese.com&PluID=56&Pos=5101190044725428&EyeblasterID=53873120&clk=1&sct=1&dg=16449088&dgo=10843710&di=0&pc=&sessionid=1759035421168368094&usercookie=u2=043f732d-40ca-4c03-978e-c74f2beea59b&OptOut=0&rtu=http%3A%2F%2Fclickc.admaster.com.cn%2Fc%2Fa111523%2Cb2738347%2Cc362%2Ci0%2Cm101%2C8a1%2C8b2%2Ch&ebReferrer=http%3A%2F%2Fwww.ftchinese.com%2F',
//             adTitle: '轩尼诗右侧'
//         };
//         window.parent.showTextImageForAd(sourceInfo);
//     }
// } catch(ignore) {
// }
