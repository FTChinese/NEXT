/*exported showInreadAd*/

function initInreadAd() { //QUEST:这个也需要改成writeAdNew的方式吗？
    //find the slot to insert inread ad
    if (!inreadAd) {return;}
    inreadAd.displayed = false;
    inreadAd.played = false;
    var inreadAdSlot = document.querySelectorAll(inreadAd.slot)[inreadAd.minSlot];
    var inreadAdContainer = document.createElement('div');
    var inreadAdWidth = inreadAdSlot.parentNode.offsetWidth;
    var videoRatio = 9 / 16;
    if (inreadAd.videoWidth > 0 && inreadAd.videoHeight > 0) {
        videoRatio = inreadAd.videoHeight / inreadAd.videoWidth;
    }
    var inreadAdHeight = Math.round(inreadAdWidth * videoRatio);
    var hostForVideo = '';
    var s = inreadAdContainer.style;
    var clickTag = '';
    var clickTagHeight;
    var iframeSrc;
    var isHTML5Video = (typeof(document.createElement('video').canPlayType) !== 'undefined');
    var videoTag;
    var muted = (inreadAd.sound === 'on') ? '' : ' muted'; 
    if (inreadAd.forceWidth && inreadAd.forceWidth > 0) {
        inreadAdWidth = inreadAd.forceWidth;
    }
    if (inreadAd.forceHeight && inreadAd.forceHeight > 0) {
        inreadAdHeight = inreadAd.forceHeight;
    }
    inreadAd.h = inreadAdHeight + 30;
    if (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168') === 0 || window.location.hostname.indexOf('10.113') === 0 || window.location.hostname.indexOf('127.0') === 0) {
        hostForVideo = 'https://www.ftchinese.com';
    }
    inreadAdContainer.id = inreadAd.id;
    s.width = inreadAdWidth + 'px';
    s.height = '0px';
    s.webkitTransition = 'height 500ms linear';
    s.transition = 'height 500ms linear';
    s.mozTransition = 'height 500ms linear';
    s.position = 'relative';
    s.overflow = 'hidden';
    s.marginLeft = 'auto';
    s.marginRight = 'auto';

    if (inreadAd.click !== '') {
        clickTagHeight = inreadAdHeight - 30;
        clickTag = '<a target="_blank" href="'+ inreadAd.click +'" style="top:0;left:0;cursor:pointer;display:block;width:100%;position:absolute;height:'+clickTagHeight+'px;border-width:0;"></a>';
    }
    
    // MARK: - If HTML 5 video is supported and the video url is not empty;
    if (isHTML5Video && inreadAd.video !== '') {
        videoTag = '<video style="width:'+ inreadAdWidth +'px;height:'+ inreadAdHeight +'px;" preload="metadata" poster="' + inreadAd.poster + '"' + muted +' autoplay loop><source src="'+ inreadAd.video +'" type="video/mp4"></video>';
        inreadAd.htmlCode = '<div style="width:100%;height:'+ inreadAdHeight +'px;position:relative;">' + videoTag + '</div>' + clickTag;
    } else {
        if (inreadAd.iframeSrc && inreadAd.iframeSrc !== '') {
            iframeSrc =  inreadAd.iframeSrc;
        } else {
            iframeSrc =  hostForVideo + '/m/corp/video.html?vid='+ inreadAd.vid +'&w='+inreadAdWidth+'&h='+inreadAdHeight+'&autostart=true&sound=' + inreadAd.sound +'&003';
        }
        inreadAd.htmlCode = '<div style="width:100%;height:'+ inreadAdHeight +'px;position:relative;"><iframe name="inread-frame" id="inread-frame" style="width:'+ inreadAdWidth +'px;height:'+ inreadAdHeight +'px;position:absolute;" src="' + iframeSrc + '" scrolling="no" frameborder="0" allowfullscreen=true></iframe></div>' + clickTag;
    }
    inreadAdSlot.parentNode.insertBefore(inreadAdContainer, inreadAdSlot);
    inreadAd.t = findTop(inreadAdContainer);
    var ele = document.getElementById(inreadAd.id);
    ele.innerHTML = inreadAd.htmlCode;
}


function showInreadAd(forcePlay) {
    var ele;
    if (forcePlay === true) {
        inreadAd.displayed = false;
    }
    if (typeof inreadAd === 'object' && inreadAd.h >0 && inreadAd.displayed === false) {
        ele = document.getElementById(inreadAd.id);
        // ele.innerHTML = inreadAd.htmlCode;
        ele.style.height = inreadAd.h + 'px';
        inreadAd.displayed = true;
        setTimeout(function() {
            ele.style.height = '0';
            ele.innerHTML = '';
        }, inreadAd.displayTime);
        if (inreadAd.impression !== '') {
            var img = document.createElement('img');
            img.src = inreadAd.impression;
        }
    }
}

initInreadAd();