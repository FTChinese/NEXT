/* jshint devel:true */
/*exported gThereIsUluAd, ftItemId, checkInView*/
var containerTop = [];
var mainHeight = [];
var sideHeight = [];
var bodyHeight;
var gNavOffsetY=0;
var gNavHeight = 44;
var gShareOffsetY;
var gStickyElementOffsetY;
var gAudioOffsetY;
var gLanguageSwitchOffsetY;
var gRecomendOffsetY;
var gRecomendInViewNoted = false;
var gStoryBodyBottomOffsetY;
//var gThereIsUluAd = 0;//MARK：表征底部为你推荐是否确实插入了联合广告，插入的话就计为1，这是为了方便统计曝光次数
//  var gShareHeight = 38;

var gInstoryAdHasTrackInview = false;

var ftItemId = window.FTStoryid || window.interactiveId || '';
var defaultPadding = 30;
var hasSideWidth = 690;
var sectionsWithSide = document.querySelectorAll('.block-container.has-side');
var sections = document.querySelectorAll('.block-container, .footer-container, .bn-ph, .mpu-container, #story_main_mpu, .in-story-recommend');
var delegate;
var htmlClass = document.documentElement.className;
var sectionsWithSideLength = sectionsWithSide.length;
var sectionClassName = [];
var sectionClassNameNew = [];
var minHeight = [];
var maxHeight = [];
var isRetinaDevice = (window.devicePixelRatio > 1);
var scrollTop = window.scrollY || document.documentElement.scrollTop;
var ticking = false;
var hostForVideo = '';
var currentFavButton;
var figures = document.querySelectorAll('figure.loading');
var figuresLazy = [];
var figuresLoadStatus = 0;
var videos = document.querySelectorAll('figure.loading-video');
var videosLazy = [];
var videosLoadStatus = 0;
var viewables = [];//存储要记录track In View的元素
var gShowLanguageSwitchOnly;

function findTop(obj) {
  var curtop = 0;
  if (obj && obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    return curtop;
  }
}

function getBodyHeight() {
  var w = window,
  d = document,
  e = d.documentElement,
  g = d.getElementsByTagName('body')[0],
  y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  return y;
}

function stickyAdsPrepare() {
  if (typeof stickyAds === 'object' && stickyAds.length>0) {
    for(var i=0; i<stickyAds.length; i++) {
      var thePlaceHolder = document.getElementById(stickyAds[i].BannerId).parentNode.parentNode.parentNode.parentNode;
      var theContainer = document.getElementById(stickyAds[i].BannerId).parentNode.parentNode.parentNode;
      stickyAds[i].oTop = findTop(thePlaceHolder);
      stickyAds[i].currentClass = theContainer.className;
    }
  }
}



// Lazy-load images
function loadImagesLazy () {
  if (figuresLoadStatus ===1 ) {
    return;
  }
  var figuresToLoad = 0;
  for (var i=0; i<figuresLazy.length; i++) {
    if (figuresLazy[i] !== '') {
      // console.log (i);
      // console.log (scrollTop);
      // console.log (bodyHeight);
      // console.log (figuresLazy[i].imageTop);
      if (scrollTop === undefined) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      }
      if (scrollTop + bodyHeight*2 > figuresLazy[i].imageTop) {
        //console.log (figuresLazy[i]);
        var figureImage = document.createElement('IMG');
        figureImage.src = figuresLazy[i].imageUrl;
        //figureImage.src = 'http://wwwfa.com/image.jpg';
        figureImage.setAttribute('data-backupimage', figuresLazy[i].imageUrlBack);
        figures[i].appendChild(figureImage);
        //figures[i].innerHTML = '<img src="' + figuresLazy[i].imageUrl + '" data-backupimage="' + figuresLazy[i].imageUrlBack + '">';
        figures[i].className = figuresLazy[i].loadedClass;
        figuresLazy[i] = '';
        setTimeout(function(){
          var isFigureImageLoaded = figureImage.complete;
          var backupImageSrc = figureImage.getAttribute('data-backupimage');
          var reloaded = figureImage.getAttribute('data-reloaded') || '';
          if (isFigureImageLoaded === false && backupImageSrc && reloaded !== 'yes') {
            figureImage.src = backupImageSrc;
            figureImage.setAttribute('data-reloaded', 'yes');
            //console.log (figureImage.src + ' complete? ' + isFigureImageLoaded + '. Reloaded? ' + reloaded);
          }
        }, 5000);
      }
      figuresToLoad ++;
    }
  }
  if (figuresToLoad === 0) {
    figuresLoadStatus = 1;
  }
}

// Lazy-load videos
function loadVideosLazy () {
  if (videosLoadStatus ===1 ) {
    return;
  }
  var videosToLoad = 0;
  for (var i=0; i<videosLazy.length; i++) {
    if (videosLazy[i] !== '') {
      if (scrollTop + bodyHeight*2 > videosLazy[i].videoTop) {
        videos[i].innerHTML = videosLazy[i].ih;
        videos[i].className = '';
        videosLazy[i] = '';
      }
      videosToLoad ++;
    }
  }
  if (videosToLoad === 0) {
    videosLoadStatus = 1;
  }
}
/*
function checkInView(obj) {
  if (scrollTop + bodyHeight > obj.top + obj.height * obj.minimum && scrollTop < obj.top + obj.height && obj.height>0 && !document.hidden) {
    return true;
  } else {
    return false;
  }
}
*/

function trackViewables() {
  // MARK: - Stop Tracking viewables for lack of GA quota
  // try {
  //   // blocks in view
  //   var ec = window.gPageId || 'Other Page';
  //   for (var j=0; j<viewables.length; j++) {
  //     if (viewables[j] !== '' && viewables[j].viewed === false) {
  //       if (checkInView(viewables[j]) === true) {
  //         var k = j;
  //         viewables[k].viewed = 'pending';
  //         setTimeout((function(k) {
  //             return function() {
  //               if (checkInView(viewables[k]) === true) {
  //                 viewables[k].viewed = true;
  //                 ga('send','event', ec, 'In View', viewables[k].id, {'nonInteraction':1});
  //                 if (viewables[k].adch !== '' && viewables[k].adPosition !== '') {
  //                   ga('send','event', 'Ad In View', viewables[k].adch, viewables[k].adPosition, {'nonInteraction':1});
  //                   //playVideoInIframe(viewables[k].adch + '' + viewables[k].adPosition);
  //                 }
  //               } else {
  //                 viewables[k].viewed = false;
  //               }
  //             };
  //         })(k), viewables[k].time);
  //       }
  //     }
  //   }
  // } catch (ignore) {

  // }
}



// Init responsive images loading
function loadImages() {

  var i;
  var queryString = window.location.search;
  var isFrenquentDevice = false;
  var MULTIPLE = 100;

  figures = document.querySelectorAll('figure.loading');
  figuresLazy = [];
  figuresLoadStatus = 0;

  try {
    // this is ironically the only sure way to write this logic
    // ([1,3,12].indexOf(w) > -1) only works for IE 9 and above
    if (w === 360 || w === 375 || w === 320 || w === 414 || w === 768 || w === 1024 || w>1220) {
      isFrenquentDevice = true;
    }
  } catch (ignore) {

  }
  for (i=0; i<figures.length; i++) {
    var thisFigure = figures[i];
    var imageWidth = thisFigure.offsetWidth;
    var imageHeight = thisFigure.offsetHeight;
    var imageTop = findTop(thisFigure);
    var imageUrl = thisFigure.getAttribute('data-url') || '';
    var imageUrlPart;
    var imageUrlBack;
    var figureClass = thisFigure.className || '';
    var fitType = 'cover';
    var figureParentClass = thisFigure.parentNode.className || '';
    var shouldLoadImage = false;
    var loadedClass = '';
    var imageServiceHost = 'https://www.ft.com/__origami/service/image/v2/images/raw/';
    var imageServiceHostFTC = 'https://thumbor.ftacademy.cn/unsafe/';
    var ftcStaticServer = 'http://i.ftimg.net/';
    var imageExists = true;
    if (imageUrl === '') {
      //console.log ('an empty image is here! Break Now! ')
      imageExists = false;
    }
    if (isRetinaDevice === true) {
      imageWidth = imageWidth * 2;
      imageHeight = imageHeight * 2;
      loadedClass = 'is-retina';
    }
    if ((!queryString || queryString.indexOf('?ad=no') === -1 ) && isFrenquentDevice === false) {
      var mod = imageWidth % MULTIPLE;
      if (mod !== 0) {
        var ratio = imageHeight / imageWidth;
        var quotient = parseInt(imageWidth / MULTIPLE, 10);
        imageWidth = (quotient + 1) * MULTIPLE;
        imageHeight = parseInt(imageWidth * ratio, 10);
        loadedClass = 'is-retina';
      }
    }

    if (imageUrl.indexOf(imageServiceHost) >= 0) {
      // MARK: If the url is already an FT Image Service url
      imageUrl = imageUrl.replace(imageServiceHost, '').replace(/\?.*$/g, '');
      imageUrl = decodeURIComponent(imageUrl);
    } else if (imageUrl.indexOf(imageServiceHostFTC) >= 0) {
      // MARK: If the url is already an FTC Image Service url
      imageUrl = imageUrl.replace(imageServiceHostFTC, '').replace(/^[0-9x]+\//g, '').replace(/^(picture)/g, ftcStaticServer + '$1');
    }

    if (/brand/.test(figureParentClass)) {
      fitType = 'contain';
    }
    imageUrlBack = encodeURIComponent(imageUrl);


    if (imageUrl.indexOf('http://i.ftimg.net/') === 0) {
      imageUrlPart = imageUrl.replace('http://i.ftimg.net/', '');
    } else {
      imageUrlPart = imageUrl;
    }

    if (/sponsor|logo/.test(figureClass)) {
      imageUrl = imageServiceHostFTC + '0x' + imageHeight + '/' + imageUrlPart;
      imageUrlBack = imageServiceHost + imageUrlBack + '?source=ftchinese&height=' + imageHeight + '&fit=' + fitType + '&from=next001';
      shouldLoadImage = true;
    } else if (imageWidth > 0 && imageHeight > 0) {
      imageUrl = imageServiceHostFTC + imageWidth + 'x' + imageHeight + '/' + imageUrlPart;
      imageUrlBack = imageServiceHost + imageUrlBack + '?source=ftchinese&width=' + imageWidth + '&height=' + imageHeight + '&fit=' + fitType + '&from=next001';
      shouldLoadImage = true;
    }

    if (window.gNoImageWithData === 'On' && window.gConnectionType === 'data') {
      shouldLoadImage = false;
    }

    // MARK: If the image doesn't even exist, it should not be loaded
    if (imageExists === false) {
      //console.log ('the image does not exist! ')
      shouldLoadImage = false;
    }

  //   console.log (imageUrl);
  // console.log (shouldLoadImage);
    if (shouldLoadImage === true) {
      // imageUrlBack = imageUrl;
      figuresLazy[i] = {
        imageTop: imageTop,
        imageUrl: imageUrl,
        imageUrlBack: imageUrlBack,
        loadedClass: loadedClass
      };

      // console.log (imageUrl);

      //thisFigure.innerHTML = '<img src="' + imageUrl + '" data-backupimage="' + imageUrlBack + '">';
      //thisFigure.className = loadedClass;
    } else {
      figuresLazy[i] = '';
    }
  }



  // load responsive videos
  videos = document.querySelectorAll('figure.loading-video');
  videosLazy = [];
  videosLoadStatus = 0;

  hostForVideo = '';
  if (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168') === 0 || window.location.hostname.indexOf('10.113') === 0 || window.location.hostname.indexOf('127.0') === 0) {
    hostForVideo = 'http://www.ftchinese.com';
  }
  for (i=0; i<videos.length; i++) {
    var thisVideo = videos[i];
    var videoTop = findTop(thisVideo);
    var videoWidth = thisVideo.offsetWidth;
    var videoHeight = thisVideo.offsetHeight;
    var videoId = thisVideo.getAttribute('data-vid');
    var itemType = thisVideo.getAttribute('data-type') || thisVideo.getAttribute('data-item-type') || 'video';
    var autoStart = thisVideo.getAttribute('data-autoplay') || '';
    var thirdPartyFrameUrl = thisVideo.getAttribute('data-third-party-frame-url');
    var videoWall = '';
    if (autoStart === 'yes') {
      autoStart = 'true';
      videoWall = '&videowall=yes';
    } else {
      autoStart = 'false';
    }

    if (videoWidth > 0 && videoHeight > 0 && queryString.indexOf('?ad=no') === -1 && hostForVideo !== 'http://www.ftchinese.com') {

      var iFrameUrl;
      if (thirdPartyFrameUrl) {
        iFrameUrl = thirdPartyFrameUrl;
      } else {
        iFrameUrl = hostForVideo + '/' + itemType + '/'+ videoId +'?i=2&w='+videoWidth+'&h='+videoHeight+'&autostart=' + autoStart + videoWall;
      }

      videosLazy[i] = {
        ih: '<iframe name="video-frame" id="video-frame" style="width:100%;height:100%;position:absolute;" src="' + iFrameUrl + '" scrolling="no" frameborder="0" allowfullscreen=true></iframe>',
        videoTop: videoTop
      };
    } else {
      videosLazy[i] = '';
    }
  }


  loadImagesLazy ();
  loadVideosLazy ();
  trackViewables();
}

function viewablesInit() {
  if (sections.length > 0 && typeof window.gPageId === 'string' && window.gPageId !== '') {
    var sectionTypes = {
      'block': 0,
      'banner': 0,
      'mpu': 0,
      'storympu':0,
      'footer': 0,
      'in-story-recommend': 0
    };
    window.bBlocked = 'unknown';
    for (var j=0; j<sections.length; j++) {
      var top = findTop(sections[j]);
      var height = sections[j].offsetHeight;
      var sectionType = 'other';
      var viewedStatus;
      var minimumHeight = 0;
      var minimumTime = 1000;
      var bannerFrame;
      var adchValue = '';
      var adPositionValue = '';
      var isAdContainer = false;
      if (typeof viewables[j] === 'object' && viewables[j].viewed) {
        viewedStatus = viewables[j].viewed;
      } else {
        viewedStatus = false;
      }


      if (sections[j].className.indexOf('bn-ph') >= 0) {
        if (j===0 && typeof top !== 'number' && document.getElementById('topad') && sections[j].previousSibling.offsetTop > 0) {
          top = sections[j].previousSibling.offsetTop;
          height = sections[j].previousSibling.offsetHeight;
        }
        sectionType = 'banner';
        minimumHeight = 0.5;
        isAdContainer = true;
      } else if (sections[j].id === 'story_main_mpu') {
        sectionType = 'storympu';
        minimumHeight = 0.5;
        isAdContainer = true;
      } else if (sections[j].className.indexOf('mpu-container') >= 0) {
        sectionType = 'mpu';
        minimumHeight = 0.5;
        isAdContainer = true;
      } else if (sections[j].className.indexOf('footer') >= 0) {
        sectionType = 'footer';
      } else if (sections[j].className.indexOf('block') >= 0) {
        sectionType = 'block';
      } else if (sections[j].className.indexOf('in-story-recommend') >= 0){
        sectionType = 'in-story-recommend';
      }

      if (isAdContainer === true) {
        bannerFrame = sections[j].querySelector('.banner-iframe');
        if (bannerFrame !== null) {
          adchValue = bannerFrame.getAttribute('data-adch') || '';
          adPositionValue = bannerFrame.getAttribute('data-adPosition') || '';
        }
      }

      sectionTypes[sectionType] ++;
      if (typeof top === 'number') {
        viewables[j] = {
          id: sectionType + '-' + sectionTypes[sectionType],
          top: top,
          height: height,
          minimum: minimumHeight,
          time: minimumTime,
          viewed: viewedStatus,
          adch: adchValue,
          adPosition: adPositionValue
        };
        
        if (j === 0) {
          window.bBlocked = 'no';
        }
      } else {
        viewables[j] = '';
        if (j === 0) {
          window.bBlocked = 'yes';
        }
        // if (j === 0) {
        //   setTimeout(function(){
        //     ga('send','event', 'home', 'In View Error Catch: 019', window.isBlocked + ': ' + sections[0].offsetTop +'/' + sections[4].offsetTop + ',' + sections[4].offsetHeight + '/' + sections[4].style.display +'/'+ sections[4].className, {'nonInteraction':1});
        //   }, 1000);
        // }
      }
     
      sections[j].setAttribute('data-id', sectionType + '-' + sectionTypes[sectionType]);

      // MARK: When in-story-recommend is viewed, change the id to the A/B test version ---测试结束
      /*
       if(sectionType === 'in-story-recommend'){
          if(window.recommendVersionInstory && viewables[j]){
            viewables[j].id = window.recommendVersionInstory;
          }
        }
        */
      //sections[j].id = sectionType + '-' + sectionTypes[sectionType];

      // MARK:When in-story-recommend has changed to the Ad, change the id to 'instroyAd' 
      
      if(sectionType === 'in-story-recommend') {
        if(window.gReplacedInstroyWithAd && viewables[j]) {
          viewables[j].id = 'instoryAd'+textIndex;
          if(gInstoryAdHasTrackInview === false) {
            viewables[j].viewed = false;
            gInstoryAdHasTrackInview = true;
          } else {
            viewables[j].viewed = true;
          }
        }
      }

    }
  }
}

function stickyBottomPrepare() {
  var topElement = document.querySelector('.o-nav__placeholder');
  if (topElement === undefined) {
    topElement = document.body;
  }
  gNavOffsetY = findTop(topElement);
  bodyHeight = getBodyHeight(gNavOffsetY);
  if (typeof recommendInner === 'object') {
    gRecomendOffsetY = findTop(recommendInner);
  }
  if (document.getElementById('story-action-placeholder')) {
    gShareOffsetY = findTop(document.getElementById('story-action-placeholder'));
  }

  if (document.getElementById('audio-placeholder')) {
    gAudioOffsetY = findTop(document.getElementById('audio-placeholder'));
  }

  var storyBodyContainer = document.getElementById('story-body-container');
  if (storyBodyContainer) {
    gStoryBodyBottomOffsetY = findTop(storyBodyContainer) + storyBodyContainer.offsetHeight;
  }

  var allStickyElementCount = document.querySelectorAll('.sticky-element').length;
  var stickyElement = document.querySelector('.sticky-element');
  var stickyElementInner;
  if (stickyElement) {
    stickyElementInner = stickyElement.querySelector('.sticky-element-inner');
  }
  if (allStickyElementCount === 1 && stickyElement && stickyElementInner) {
    // MARK: - Set the height as auto first so that if the page is changed by an ajax callback, we can recalculate the offsetHeight. 
    stickyElement.style.height = 'auto';
    stickyElementInner.style.height = 'auto';
    gStickyElementOffsetY = findTop(stickyElement);
    var stickyElementHeight = stickyElement.offsetHeight;
    var stickyElementWidth = stickyElementInner.offsetWidth;
    if (stickyElementHeight > 0 && stickyElementWidth > 0) {
      stickyElement.style.height = stickyElementHeight + 'px';
      stickyElementInner.style.height = stickyElementHeight + 'px';
      stickyElementInner.style.width = stickyElementWidth + 'px';
    }
  }
  
  var languageSwitchEle = document.getElementById('language-switch-placeholder');
  if (languageSwitchEle) {
    gLanguageSwitchOffsetY = findTop(languageSwitchEle);
  }

  w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (sectionsWithSide && sectionsWithSide.length > 0) {
    for (var i=0; i<sectionsWithSide.length; i++) {
      sectionClassName[i] = sectionsWithSide[i].className;       
      if (w < hasSideWidth) {
        sectionClassNameNew[i] = sectionClassName[i].replace(/ fixmain| fixside| bottommain| bottomside| sticktop/g,'');
        if (sectionClassNameNew[i] !== sectionClassName[i]) {
          // remove sticky side on mobile phone
          sectionClassName[i] = sectionClassNameNew[i];
          sectionsWithSide[i].className = sectionClassNameNew[i];
        }
      } else if (!/fixmain|fixside|bottommain|bottomside|sticktop/.test(sectionClassName[i])) {
        //calculate heights only when the sticky classes are not present
        containerTop[i] = findTop(sectionsWithSide[i]);
        mainHeight[i] = sectionsWithSide[i].querySelector('.content-inner').offsetHeight;
        sideHeight[i] = sectionsWithSide[i].querySelector('.side-inner').offsetHeight + defaultPadding;
        minHeight[i] = Math.min(mainHeight[i], sideHeight[i]);
        maxHeight[i] = Math.max(mainHeight[i], sideHeight[i]);
      }
      //sectionsWithSide[i].querySelector('.side-inner').style.backgroundColor = 'grey';
    }
  }

  viewablesInit();
}

function stickyBottomUpdate() {


  var htmlClassNew = htmlClass.replace(/( o-nav-sticky)|( tool-sticky)|( audio-sticky)|( sticky-element-on)/g, '');
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(stickyBottomUpdate);
  }

    //language switch
  if (typeof gLanguageSwitchOffsetY === 'number' && gLanguageSwitchOffsetY > gNavOffsetY) {
    if (scrollTop + gNavOffsetY >= gLanguageSwitchOffsetY ) {
      //console.log ('should show language switch');
      htmlClassNew += ' audio-sticky';
    }
  } else if (typeof gShareOffsetY === 'number' && gShareOffsetY > gNavOffsetY) {
    if (scrollTop >= gShareOffsetY) {
      htmlClassNew += ' tool-sticky';
    } else 
    if (scrollTop >= gNavHeight) {
      htmlClassNew += ' o-nav-sticky'; 
    }
  } else {
    if (scrollTop >= gNavOffsetY) {
      htmlClassNew += ' o-nav-sticky';
    }
  }


  //sticky audio player
  if (typeof gAudioOffsetY === 'number' && gAudioOffsetY > gNavOffsetY) {
    if (scrollTop + gNavOffsetY >= gAudioOffsetY ) {
      htmlClassNew += ' audio-sticky';
    }
  }

  //sticky element
  if (typeof gStickyElementOffsetY === 'number' && gStickyElementOffsetY > gNavOffsetY) {
    if (scrollTop + gNavHeight >= gStickyElementOffsetY ) {
      htmlClassNew += ' sticky-element-on';
    }
  }

  if (htmlClassNew !== htmlClass) {
    htmlClass = htmlClassNew;
    document.documentElement.className = htmlClass;
  }




  // sticky sides
  if (sectionsWithSideLength > 0 && w > hasSideWidth) {
    for (var i=0; i<sectionsWithSideLength; i++) {
      sectionClassNameNew[i] = sectionClassName[i].replace(/fixmain|fixside|bottommain|bottomside|sticktop/g,'');
      var maxScroll = 0;
      var minScroll = 0;
      var stickTopClass = '';
      

      if (maxHeight[i] + gNavHeight + defaultPadding >= bodyHeight && maxHeight[i] - minHeight[i] >= 100) {
        if (minHeight[i] + gNavHeight + defaultPadding < bodyHeight) {
          // when min height is less than bodyheight
          // stick to top
          stickTopClass = ' sticktop';
          maxScroll = containerTop[i] + maxHeight[i] - minHeight[i] - scrollTop - gNavHeight - defaultPadding;
          minScroll = containerTop[i] - gNavHeight - scrollTop - defaultPadding;

          if (/side-left/.test(sectionClassName[i])) {
            maxScroll = maxScroll + defaultPadding;
          }

        } else {
          // otherwise stick to bottom
          maxScroll = containerTop[i] + maxHeight[i] - bodyHeight - scrollTop;
          minScroll = containerTop[i] + minHeight[i] - bodyHeight - scrollTop;
          if (/side-left/.test(sectionClassName[i])) {
            maxScroll = maxScroll + defaultPadding/2;
          }
        }
        if (mainHeight[i]>sideHeight[i]) {
          if (maxScroll<=0) {
            sectionClassNameNew[i] += ' bottomside';
          } else if (minScroll<=0 ) {
            sectionClassNameNew[i] += ' fixside' + stickTopClass;
          }
        } else if (mainHeight[i]<sideHeight[i]) {
          if (maxScroll<30) {
            sectionClassNameNew[i] += ' bottommain';
          } else if (minScroll<0){
            sectionClassNameNew[i] += ' fixmain' + stickTopClass;
          }
        }
      }

      sectionClassNameNew[i] = sectionClassNameNew[i].replace(/[\s]+/g,' ');
      if (sectionClassNameNew[i] !== sectionClassName[i]) {
        sectionClassName[i] = sectionClassNameNew[i];
        sectionsWithSide[i].className = sectionClassNameNew[i];
      }
    }
  }

  // sticky ads
  if (typeof stickyAds === 'object' && stickyAds.length >0) {
    for (var j=0; j<stickyAds.length; j++) {
      var oTop = stickyAds[j].oTop - scrollTop - gNavHeight;
      var oTop2 = oTop + stickyAds[j].stickyHeight;
      var newClass = '';
      if (oTop <= 0 && oTop2 >0) {
        newClass = ' is-fix';
      } else {
        newClass = '';
      }
      newClass = 'banner-container' + newClass;
      //console.log (newClass + '/' + stickyAds[i].currentClass + '/' + document.getElementById(stickyAds[i].BannerId).parentNode.parentNode.className);

      if (newClass !== stickyAds[j].currentClass) {
        stickyAds[j].currentClass = newClass;
        document.getElementById(stickyAds[j].BannerId).parentNode.parentNode.parentNode.className = newClass;
      }
    }
  }


  // blocks in view
  // story recommend
  if (gRecomendInViewNoted === false && window.recommendLoaded === true && typeof window.recommendInner === 'object' && gRecomendOffsetY > 0) {
    if (scrollTop + bodyHeight > gRecomendOffsetY) {
      //send event to google for once
      if (window.ftItemId === undefined) {
        window.ftItemId = '';
      }
      // MARK: - stop tracking for lack of GA quota
      //ga('send','event','Story Recommend', 'Seen' + window.recommendVersion, ftItemId, {'nonInteraction':1});

      // MARK: - stop tracking for lack of GA quota
      // MARK: If there is uluAd, send another ga 'seen' eventAction
      // if(gThereIsUluAd === 1) {
      //   ga('send','event','Story Recommend With Ad', 'Seen' + window.recommendVersion, ftItemId, {'nonInteraction':1});
      // }
      
      gRecomendInViewNoted = true;
      //console.log ('in view');
    }
  }

  // in read ad in view
  if (typeof inreadAd === 'object' && inreadAd.h >0 && inreadAd.t >0 && inreadAd.displayed === false) {
      if (scrollTop + bodyHeight > inreadAd.t + inreadAd.h) {
        showInreadAd();
      }
  }
  loadImagesLazy();
  loadVideosLazy();
  trackViewables();
  trackQualityRead();
}



function requestTick() {
  if(!ticking) {
    requestAnimationFrame(stickyBottomUpdate);
  }
  ticking = true;
}

function stickyBottom() {
  scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (typeof requestAnimationFrame === 'function') {
    requestTick();
  } else {
    stickyBottomUpdate();
  }
}


function setResizeClass() {
  if (htmlClass.indexOf(' resized') < 0 && gShowLanguageSwitchOnly === false) {
    htmlClass += ' resized';
    document.documentElement.className = htmlClass;
  }
}

function validHTMLCode() {
  if (/print|findpassword|search|corp|marketing|event|innotree|webview=ftcapp|newad=yes/.test(window.location.href)) {
    return;
  }
  var validateFail = false;
  if (document.querySelectorAll) {
    if (window.gPageId === 'home') {
      if (document.querySelectorAll('.item-container').length === 0) {
        validateFail = true;
      }
    } else if (window.gPageId === 'story') {
      if (document.querySelectorAll('.story-body, .subscribe-lock-container').length === 0) {
        validateFail = true;
      }
    } else if (typeof window.gPageId === 'string'){
      if (document.querySelectorAll('.item-container').length === 0) {
        validateFail = true;
      }
    }
    if (validateFail === true) {
      // MARK: - Stop Tracking For lack of GA quota
      //ga('send','event','CatchError', 'Page Validation Fail', window.location.href, {'nonInteraction':1});
      ga('send','event','CatchError', 'Page Validation Fail', 'Some Page', {'nonInteraction':1});

    }
  }
}

function checkLanguageSwitch() {
  var referralUrl = document.referrer || '';
  var hostName = window.location.hostname || '';
  var fromInSite = (referralUrl !== '' && hostName !== '' && referralUrl.indexOf(hostName) >= 0);
  var hasLanguageSwitch;
  if (document.querySelector('.language-switch-inner')) {
    hasLanguageSwitch = true;
  } else {
    hasLanguageSwitch = false;
  }
  if ((fromInSite || isTouchDevice()) && hasLanguageSwitch) {
    document.documentElement.className += ' show-language-switch-only audio-sticky';
    gShowLanguageSwitchOnly = true;
  } else {
    gShowLanguageSwitchOnly = false;
  }
}

// MARK: - Check if a dom is actually hidden
function isHidden(el) {
    return (el.offsetParent === null);
}

function openLink(theLink) {
  try {
    webkit.messageHandlers.link.postMessage(theLink);
  } catch(error) {
    document.location = theLink;
  }
}

function trackInternalPromos() {
  // MARK: Use a set timeout to track display. 
  setTimeout(function() {
    var allPromos = document.querySelectorAll('.n-internal-promo');
    for (var i=0; i<allPromos.length; i++) {
      var currentPromo = allPromos[i];
      var promoId = currentPromo.getAttribute('data-promo-id');
      var promoName = currentPromo.getAttribute('data-promo-name');
      var promoCreative = currentPromo.getAttribute('data-promo-creative');
      var promoPosition = currentPromo.getAttribute('data-promo-position');
      if (isHidden(currentPromo) === false) {
        ga('ec:addPromo', {
          'id': promoId,
          'name': promoName,
          'creative': promoCreative,
          'position': promoPosition
        });
        ga('send','event','Web Privileges', 'Display', 'From:' + promoId, {'nonInteraction':1});
        currentPromo.onclick = function() {
          var promoId = this.getAttribute('data-promo-id');
          var promoName = this.getAttribute('data-promo-name');
          var promoCreative = this.getAttribute('data-promo-creative');
          var promoPosition = this.getAttribute('data-promo-position');
          ga('ec:addPromo', {
            'id': promoId,
            'name': promoName,
            'creative': promoCreative,
            'position': promoPosition
          });
          ga('ec:setAction', 'promo_click');
          var theLink = this.href;
          ga('send','event','Web Privileges', 'Tap', 'From:' + promoId, {
              hitCallback: function() {
                openLink(theLink);
              }
          });
          // MARK: If for some reason GA is not accessible, redirectly regardless
          // setTimeout(function() {
          //   openLink(theLink);
          // }, 3000);
          // MARK: Track the event then go to link 
          return !ga.loaded;
        };
      }
    }
  }, 3000);
}


function trackRead(ea, metricValue) {
  if (ftItemId !== '' && window[ea] !== true) {
    ga('set', metricValue, '1');
    ga('send','event', 'Quality Read', ea, ftItemId, {'nonInteraction':1});
    window[ea] = true;
  }
}

function trackQualityRead() {
  //console.log ('scroll: ' + scrollTop + ', body height: ' + bodyHeight + ', story body bottom: ' + gStoryBodyBottomOffsetY);
  if (gStoryBodyBottomOffsetY === undefined) {
    return;
  }
  var storyScrollDistance = gStoryBodyBottomOffsetY - bodyHeight;
  if (storyScrollDistance > 0) {
    if (scrollTop >= storyScrollDistance) {
      trackRead('Read To End', 'metric5');
    } else if (scrollTop >= storyScrollDistance/2) {
      trackRead('Read To Half', 'metric4');
    }
  }
}

try {
  delegate = new Delegate(document.body);
} catch (ignore) {

}

try {
  validHTMLCode();
} catch (ignore) {

}

// get the top of navigation
gNavOffsetY = findTop(document.querySelector('.o-nav__placeholder'));
if (gNavOffsetY === 0) {
  gNavOffsetY = findTop(document.querySelector('.site-map'));
}

var addEvent =  window.attachEvent||window.addEventListener;
var eventResize = window.attachEvent ? 'onresize' : 'resize';
var eventScroll = window.attachEvent ? 'onscroll' : 'scroll';

checkLanguageSwitch();

// MARK: - disable sticky scroll on touch devices, 
if (((gNavOffsetY > 30 && w > 490/* && isTouchDevice() === false*/) || document.getElementById('audio-placeholder')) && gShowLanguageSwitchOnly === false) {
  try {
    stickyBottomPrepare();
    stickyAdsPrepare();
    addEvent(eventScroll, function(){
        stickyBottom();
    });
    addEvent(eventResize, function(){
        stickyBottomPrepare();
        stickyAdsPrepare();
        //reloadBanners();
        setResizeClass();
        loadImages();
    });
    setInterval(function(){
        stickyBottomPrepare();
        stickyAdsPrepare();
    }, 10000);
  } catch (ignore) {

  }
} else {
  bodyHeight = getBodyHeight();
  addEvent(eventResize, function(){
      bodyHeight = getBodyHeight();
      //reloadBanners();
      loadImages();
      setResizeClass();
  });
  addEvent(eventScroll, function(){
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      loadImagesLazy();
      loadVideosLazy();
      trackViewables();
  });
}

// check svg support
// SVG is default, no-svg is exception
if (typeof SVGRect === 'undefined') {
  document.documentElement.className += ' no-svg';
}

loadImages();//MARK:Here is where to loadImages really,which is called with no events fired
viewablesInit();

// MARK: - A cool trick to handle images that fail to load
try {
  delegate.on('error', 'img', function(){
    if (this.getAttribute('src') === '') {
      return;
    }
    var backupImg = this.getAttribute('data-backupimage') || '';
    if (backupImg !== '') {
      this.setAttribute('data-backupimage', '');
      this.src = backupImg;
    } else {
      this.setAttribute('data-hide-image-reason', 'failed to load');
      this.style.display = 'none';
    }
    //console.log ('load image error handled: ' + this.src); 
  });
} catch (ignore) {

}

// click events
try {
  delegate.on('click', '.video-package .XL2 a.image', function(){
    var link = hostForVideo + this.getAttribute('href');
    var videoPackage = this.parentNode.parentNode.parentNode;
    var videoEle = videoPackage.querySelector('#video-package-play');
    var videoWidth = videoEle.offsetWidth;
    var videoHeight = videoEle.offsetHeight;
    var thisItemEle = this.parentNode.parentNode;
    var thisHeadline = thisItemEle.querySelector('.item-headline a').innerHTML;
    var allVideos = this.parentNode.parentNode.parentNode.querySelectorAll('.video-package .XL2');
    link = link.replace(/#.*$/g,'');
    for (var i=0; i<allVideos.length; i++) {
      var thisClassName = allVideos[i].className;
      if (thisClassName.indexOf(' on')>=0) {
        thisClassName = thisClassName.replace(' on', '');
        allVideos[i].className = thisClassName; 
      }
    }
    this.parentNode.parentNode.className += ' on';
    videoEle.querySelector('iframe').src = link  +'?i=2&k=1&w='+videoWidth+'&h='+videoHeight+'&autostart=true';
    videoPackage.querySelector('.video-package-title a').innerHTML = thisHeadline;
    videoPackage.querySelector('.video-package-title a').href = link;
    return false;
  });
  delegate.on('click', 'a, .track-click', function(){
    var ec = this.getAttribute('data-ec') || '';
    var ea = this.getAttribute('data-ea') || '';
    var el = this.getAttribute('data-el') || '';
    if (ec !== '' && ea !== '') {
      // MARK: stop tracking for lack of GA quota
      // console.log ('yes');
      // console.log (this.className);
      if (this.className.indexOf('track-click') >= 0) {
        ga('send','event',ec, ea, el);
      }
      // MARK: If there is a cooperative adverising in bottom Recommend Section, these code to send img.src to third part
      if (el === 'uluAd') {
          var uluAdImage = new Image();
          var uluAdUrl = 'http://e.cn.miaozhen.com/r/k=2049651&p=76w3I&dx=__IPDX__&rt=2&ns=__IP__&ni=__IESID__&v=__LOC__&xa=__ADPLATFORM__&tr=__REQUESTID__&mo=__OS__&m0=__OPENUDID__&m0a=__DUID__&m1=__ANDROIDID1__&m1a=__ANDROIDID__&m2=__IMEI__&m4=__AAID__&m5=__IDFA__&m6=__MAC1__&m6a=__MAC__&o=';
          
          var retryTime = 0;
          var seccessAction = 'Success';
          var failAction = 'Fail';

          var uluAdSendOneTime = function() {
            if(retryTime>0) {
              seccessAction = 'Success' + retryTime;
              failAction = 'Fail' + retryTime;
            }
            uluAdImage.onload = function() {
              // MARK: Stop Tracking for GA quota
              //ga('send','event','uluAd',seccessAction,uluAdUrl);
            };
            uluAdImage.onerror = function() {
              // MARK: Stop Tracking for GA quota
              //ga('send','event','uluAd',failAction,uluAdUrl);
              retryTime++;
              if(retryTime<=5) {
                uluAdSendOneTime();
              }
            };
            uluAdImage.src = uluAdUrl;
          };
          uluAdSendOneTime();
          // MARK: Stop Tracking for GA quota
          //ga('send','event','uluAd','Request',uluAdUrl);
      }
    }
  });

  delegate.on('click', '.overlay', function(e){
    if (e.target.className === 'cell') {
      closeOverlay();
    }
  });
} catch (ignore) {

}


//click to close
delegate.on('click', '.overlay-close, .overlay-bg', function(){
  var parentId = this.getAttribute('data-parentid');
  closeOverlay(parentId);
});

//click to toggle editions
delegate.on('click', '.current-edition span', function(){
  var currentEditionClass = this.parentNode.parentNode.className;
  if (currentEditionClass.indexOf(' on')>0) {
    currentEditionClass = currentEditionClass.replace(/ on/g, '');
  } else {
    currentEditionClass += ' on';
  }
  this.parentNode.parentNode.className = currentEditionClass;
});

//click to close
delegate.on('click', '.icon-save button', function(){
  if(username===''||username===null){
      alert('您必须登录后能才能收藏文章!');
      return;
  }
  var storyid = this.id.replace(/addfavlink/g,'');
  var favAction;
  //console.log (this.innerHTML);
  if (this.innerHTML === '收藏') {
    favAction = 'add';
  } else if (this.innerHTML === '删除') {
    favAction = 'remove';
  } else {
    return;
  }
  //console.log ('2: ' + this.innerHTML);
  currentFavButton = document.getElementById('addfavlink'+storyid) || document.getElementById('addfavlink');
  currentFavButton.innerHTML = (favAction === 'add') ? '保存...': '删除...';
  // /index.php/users/removefavstory/"+s
  var xhr1 = new XMLHttpRequest();
  xhr1.open('POST', '/users/' + favAction + 'favstory/' + storyid);
  xhr1.setRequestHeader('Content-Type', 'application/text');
  xhr1.onload = function() {
      if (xhr1.status === 200) {
          var data = xhr1.responseText;
          if (data === 'ok' || data === '') {
              currentFavButton.innerHTML = (favAction === 'add') ? '删除': '收藏';
          }
      } else if (xhr1.status !== 200) {
          //alert('Request failed.  Returned status of ' + xhr.status);
      }
  };
  xhr1.send(JSON.stringify({
      storyid: storyid
  }));
});

delegate.on('click', '.close-img', function(){  
  var warnContent = document.querySelector('.warn-content');
  if(warnContent){
    warnContent.style.display = 'none';
    SetCookie('DSW','1','','/',null);
  }

});

trackInternalPromos();

var deleteWarn = GetCookie('DSW') || '';
var warnContent = document.querySelector('.warn-content');
if(warnContent){
  if(deleteWarn){
    warnContent.style.display = 'none';
  }else{ 
    warnContent.style.display = 'block';
  }
}


// MARK: - Don't show full screen ads for paid users
try {
  if (window.gUserType === 'VIP' || window.gUserType === 'Subscriber') {
      var fullScreenContainers = document.querySelectorAll('.o-ads.fullscreen-pc, .o-ads.fullscreen-ad');
      for (var i=0; i<fullScreenContainers.length; i++) {
        fullScreenContainers[i].setAttribute('data-o-ads-formats-small', 'false');
        fullScreenContainers[i].setAttribute('data-o-ads-formats-medium', 'false');
        fullScreenContainers[i].setAttribute('data-o-ads-formats-large', 'false');
        fullScreenContainers[i].setAttribute('data-o-ads-formats-extra', 'false');
        fullScreenContainers[i].setAttribute('data-o-ads-formats-default', 'false');
      }
  }
} catch(ignore) {
}

// MARK: - add link to touch screen web page
if (isTouchDevice() && window.location.href.indexOf('ftcapp') < 0) {
  var itemLeads = document.querySelectorAll('.item-lead');
  for (var i=0; i<itemLeads.length; i++) {
    var itemContainer = itemLeads[i].parentNode;
    if (itemContainer) {
      var itemHeadline = itemContainer.querySelector('.item-headline-link');
      if (itemHeadline) {
        var link = itemHeadline.href;
        if (link && link !== '') {
          itemLeads[i].innerHTML = '<a href="' + link + '">' + itemLeads[i].innerHTML + '</div>';
        }
      }
    }
  }
}

trackRead('Start Read', 'metric3');