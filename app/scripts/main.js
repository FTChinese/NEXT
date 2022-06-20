/* jshint devel:true */
/*exported gThereIsUluAd, ftItemId, checkInView*/
var containerTop = [];
var mainHeight = [];
var sideHeight = [];
var bodyHeight;
var gNavOffsetY=0;
var gNavHeight = 44;
var gShareFixTop = 80;
var gBlockPadding = 30;
var gShareOffsetHeight;
var gStoryContentOffsetY;
var gStoryContentOffsetHeight;
var gStickyElementOffsetY;
var gAudioOffsetY;
var gLanguageSwitchOffsetY;
var gRecomendOffsetY;
var gRecomendInViewNoted = false;
var gStoryBodyBottomOffsetY;
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
  trackQualityRead();
}



// Init responsive images loading
function runLoadImages() {

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
    var ftcStaticServer = 'https://thumbor.ftacademy.cn/unsafe/';
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
      imageUrl = imageUrl.replace(imageServiceHostFTC, '')
        .replace(/^[0-9x]+\//g, '')
        .replace(/^(picture)/g, ftcStaticServer + '$1');
      
    }
    if (/brand/.test(figureParentClass)) {
      fitType = 'contain';
    }
    imageUrlBack = encodeURIComponent(imageUrl);
    imageUrlPart = imageUrl.replace(/^(https:\/\/thumbor\.ftacademy\.cn\/unsafe\/)|(http:\/\/i\.ftimg\.net\/)/g, '');
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

function loadImages() {
  if (typeof Android === 'undefined') {
    runLoadImages();
  } else {
    setTimeout(function(){
      runLoadImages();
    }, 500);
  }
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

  var shareActionsEle = document.querySelector('.story-action .action-inner');
  if (shareActionsEle) {
    gShareOffsetHeight = shareActionsEle.offsetHeight;
  }

  var storyContainerEle = document.querySelector('.story-page');
  if (storyContainerEle) {
    gStoryContentOffsetY = findTop(storyContainerEle);
    gStoryContentOffsetHeight = storyContainerEle.offsetHeight;
  }


  if (document.getElementById('audio-placeholder')) {
    gAudioOffsetY = findTop(document.getElementById('audio-placeholder'));
  }

  var storyBodyContainer = document.querySelector('#story-body-container, .story-container');
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
    }
  }
  viewablesInit();
  if (document.querySelector('.header-container') === null) {
    document.documentElement.classList.add('has-no-header');
    htmlClass = document.documentElement.className;
  }
}

function addStickyStyles() {
  // MARK: - If this is run, it means the browser supports position sticky. Then it must support classList. 
  var sideContainers = document.querySelectorAll('.side-container');
  for (var i=0; i<sideContainers.length; i++) {
    sideContainers[i].classList.add('is-sticky-top');
  }
  var storyContainer = document.querySelector('.story-container');
  if (storyContainer) {
    storyContainer.classList.add('show-sticky-tools');
  }
}

function addAudioStickyStyles() {
  var audioPlaceHolder = document.getElementById('audio-placeholder');
  if (audioPlaceHolder) {
    audioPlaceHolder.classList.add('is-sticky-top');
  }
}

function stickyBottomUpdate() {

  // MARK: - It's important to clean all the existing known classes
  var htmlClassNew = htmlClass.replace(/( o-nav-sticky)|( tool-sticky)|( sticky-element-on)|( tool-bottom)/g, '');
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(stickyBottomUpdate);
  }

    //language switch
  if (typeof gLanguageSwitchOffsetY === 'number' && gLanguageSwitchOffsetY > gNavOffsetY) {

  } else {
    if (scrollTop >= gNavOffsetY) {
      htmlClassNew += ' o-nav-sticky';
    }
  }
  

  if (typeof gStoryContentOffsetY === 'number') {
    // console.log ('scrollTop: ' + scrollTop + ', gShareOffsetHeight: ' + gShareOffsetHeight + ', gStoryContentOffsetY: ' + gStoryContentOffsetY + ', gStoryContentOffsetHeight: ' + gStoryContentOffsetHeight);
    // console.log (gStoryContentOffsetHeight + gStoryContentOffsetY - gShareOffsetHeight - gShareFixTop - gBlockPadding - scrollTop);
    if (scrollTop >= gStoryContentOffsetHeight + gStoryContentOffsetY - gShareOffsetHeight - gShareFixTop - gBlockPadding) {
      htmlClassNew += ' tool-bottom';
    } else 
    if (scrollTop >= gStoryContentOffsetY - gShareFixTop) {
      htmlClassNew += ' tool-sticky';
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
      gRecomendInViewNoted = true;
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
  if (htmlClass.indexOf(' resized') < 0) {
    document.documentElement.className += ' resized';
    htmlClass = document.documentElement.className;
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
  }
}

function checkLanguageSwitch() {
  var hasLanguageSwitch;
  if (document.querySelector('.language-switch-inner')) {
    hasLanguageSwitch = true;
  } else {
    hasLanguageSwitch = false;
  }
  if (hasLanguageSwitch) {
    document.documentElement.className += ' has-language-switch';
    
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
      var eventCategory = currentPromo.getAttribute('data-event-category') || 'Web Privileges';
      if (isHidden(currentPromo) === false) {
        gtag('event', 'view_promotion', {
          promotions: [
            {
              id: promoId,
              name: promoName,
              creative_name: promoCreative,
              creative_slot: promoPosition
            }
          ]
        });
        gtag('event', 'Display', {'event_label': 'From:' + promoId, 'event_category': eventCategory, 'non_interaction': true});
        currentPromo.onclick = function() {
          var promoId = this.getAttribute('data-promo-id');
          var promoName = this.getAttribute('data-promo-name');
          var promoCreative = this.getAttribute('data-promo-creative');
          var promoPosition = this.getAttribute('data-promo-position');
          var eventCategory = this.getAttribute('data-event-category') || 'Web Privileges';
          gtag('event', 'select_content', {
            promotions: [
              {
                'id': promoId,
                'name': promoName,
                'creative_name': promoCreative,
                'creative_slot': promoPosition
              }
            ]
          });
          var theLink = this.href;
          var linkClicked = false;
          var linkTarget = this.getAttribute('target');
          function openLinkOnce() {
              if (!linkClicked) {
                openLink(theLink);
                linkClicked = true;
              }
          }
          if (theLink && !linkTarget) {
            setTimeout(openLinkOnce, 1000);
            gtag('event', 'Tap', {
              'event_label': 'From:' + promoId, 
              'event_category': eventCategory, 
              'event_callback': function() {
                openLinkOnce();
              }
            });
            // MARK: Track the event then go to link 
            return false;
          } else {
            gtag('event', 'Tap', {
              'event_label': 'From:' + promoId, 
              'event_category': eventCategory
            });
          }
        };
      }
    }
  }, 3000);
}


function trackRead(ea, metricName) {
  if (ftItemId !== '' && window[ea] !== true) {
    // MARK: - Try to send this info to native app first
    var info = {
      action: ea
    };
    if (window.privilegeEventLabel !== undefined && window.gUserType !== 'Subscriber' && window.gUserType !== 'VIP') {
      return;
    }
    try {
      if (webkit) {
        webkit.messageHandlers.qualityread.postMessage(info);
      } else if (Android) {
        Android.qualityread(JSON.stringify(info));
      }
    } catch (ignore) {
      
    }
    var el = window.privilegeEventLabel || ftItemId;
    var parameters = {'send_page_view': false};
    parameters[metricName] = 1;
    gtag('config', gaMeasurementId, parameters);
    gtag('event', ea, {'event_label': el, 'event_category': 'Quality Read'});
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
    // MARK: - GA has a limit! stop tracking read to end! 
    if (scrollTop >= storyScrollDistance/2) {
      trackRead('Read To Half', 'read_to_half');
    }
    //console.log('Scroll Top: ' + scrollTop + ', Story Scroll Distance: ' + storyScrollDistance);
    var scrollPercentage = parseInt(100 * scrollTop / storyScrollDistance, 10);
    setProgress(scrollPercentage);
  }
}

function checkFullGridItem() {
  try {
    if (!document.querySelector('.full-grid-story')) {return;}
    // MARK: - There might be other full grid items, add them when needed
    var fullGridItems = document.querySelectorAll('[data-layout-width="full-grid"], blockquote, .n-content-big-number, [data-table-layout-largescreen="full-grid"]');
    var bodyHeight = getBodyHeight();
    var isFullGridItemInView = false;
    console.log(fullGridItems);
    for (var i=0; i<fullGridItems.length; i++) {
      var itemHeight = fullGridItems[i].offsetHeight;
      var itemTop = findTop(fullGridItems[i]);
      isFullGridItemInView = (scrollTop + bodyHeight >= itemTop && itemTop + itemHeight >= scrollTop);
      if (isFullGridItemInView) {break;}
    }
    var isFullGridItemInViewClass = 'full-grid-item-in-view';
    if (isFullGridItemInView) {
      document.documentElement.classList.add(isFullGridItemInViewClass);
    } else {
      document.documentElement.classList.remove(isFullGridItemInViewClass);
    }
  } catch (ignore){}
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
addAudioStickyStyles();
// MARK: - Use pure CSS sticky when possible
var supportStickyPosition = (typeof CSS === 'object' || typeof CSS === 'function') && CSS.supports && CSS.supports('position', 'sticky');
if (gNavOffsetY > 30 && w > 490 && supportStickyPosition === false) {
  try {
    stickyBottomPrepare();
    stickyAdsPrepare();
    addEvent(eventScroll, function(){
        stickyBottom();
        trackViewables();
        checkFullGridItem();
    });
    addEvent(eventResize, function(){
        stickyBottomPrepare();
        stickyAdsPrepare();
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
  stickyBottomPrepare();
  addStickyStyles();
  bodyHeight = getBodyHeight();
  addEvent(eventResize, function(){
      bodyHeight = getBodyHeight();
      loadImages();
      setResizeClass();
  });
  addEvent(eventScroll, function(){
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      loadImagesLazy();
      loadVideosLazy();
      trackViewables();
      checkFullGridItem();
  });
}

// check svg support
// SVG is default, no-svg is exception
if (typeof SVGRect === 'undefined') {
  document.documentElement.className += ' no-svg';
}

// MARK: loadImages called with no events fired
loadImages();
viewablesInit();

// MARK: - Sometimes loadImages just doesn't fire as we expected. For example, when you have a image that's supposed to be displayed only to premium users. This hacking deals with blank image areas at the top of the page. Sorry! 
var refreshTimes = [1000, 3000, 5000, 10000, 20000];
for (var i=0; i<refreshTimes.length; i++) {
    setTimeout(function(){loadImages();}, refreshTimes[i]);
}

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
        gtag('event', ea, {'event_label': el, 'event_category': ec});
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
            };
            uluAdImage.onerror = function() {
              retryTime++;
              if(retryTime<=5) {
                uluAdSendOneTime();
              }
            };
            uluAdImage.src = uluAdUrl;
          };
          uluAdSendOneTime();
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
  var id = this.id.replace(/addfavlink/g,'');
  var itemType = this.getAttribute('data-item-type') || 'story';
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
  currentFavButton = document.getElementById('addfavlink'+id) || document.getElementById('addfavlink');
  currentFavButton.innerHTML = (favAction === 'add') ? '保存...': '删除...';
  // /index.php/users/removefavstory/"+s
  var xhr1 = new XMLHttpRequest();
  xhr1.open('POST', '/users/' + favAction + 'favstory/' + id);
  xhr1.setRequestHeader('Content-Type', 'application/text');
  xhr1.onload = function() {
      if (xhr1.status === 200) {
          var data = xhr1.responseText;
          if (data === 'ok' || data === '' || data.indexOf('ok') === 0) {
              currentFavButton.innerHTML = (favAction === 'add') ? '删除': '收藏';
          }
      } else if (xhr1.status !== 200) {
          //alert('Request failed.  Returned status of ' + xhr.status);
      }
  };
  xhr1.send(JSON.stringify({
      storyid: id,
      type: itemType
  }));
});

delegate.on('click', '.close-img', function(){  
  var warnContent = document.querySelector('.warn-content');
  if(warnContent){
    warnContent.style.display = 'none';
    SetCookie('DSW','1','','/',null);
  }

});

delegate.on('click', '.item-container:not([data-id]) .item-lead', function(){
  if (this.querySelector('a')) {return;}
  this.classList.toggle('expanded');
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
// MARK: - GA has a hit limit! Stop tracking start read! 
// MARK: - only the web site story page has privilegeEventLabel for now
if (window.privilegeEventLabel !== undefined && (window.gUserType === 'Subscriber' || window.gUserType === 'VIP')) {
  window.privilegeEventCategory = window.privilegeEventCategory || 'Web Privileges';
  gtag('event', 'Read', {'event_label': window.privilegeEventLabel, 'event_category': window.privilegeEventCategory, 'non_interaction': true});
}


function setProgress(percent) {
  if (window.circle === null || window.circle === undefined || percent === window.currentPercent) {return;}
  var offset = window.circumference - percent / 100 * window.circumference; 
  window.circle.style.strokeDashoffset = offset; 
  window.currentPercent = offset; 
  if (percent >= 100) {
    window.hasFinishedReading = true;
    window.circle.style.fill = '#990f3d';
    window.circle.style.stroke = 'transparent';
  } else {
    window.circle.style.fill = '#f2dfce';
    window.circle.style.stroke = '#990f3d';
  }
  if (window.hasFinishedReading === true) {
    document.querySelector('.progress-tick-path').style.fill = (percent >= 100) ? 'white' : '#990f3d';
  }
}

function initProgressCircle() {
  if (window.cutsTheMustard) {
    window.circle = document.querySelector('circle');
    if (window.circle === null || window.circle === undefined) {return;}
    var radius = window.circle.r.baseVal.value;
    window.circumference = radius * 2 * Math.PI;
    window.circle.style.strokeDasharray = window.circumference + ' ' + window.circumference;
    window.circle.style.strokeDashoffset = window.circumference;
    setProgress(0);
    window.circle.style.stroke = '#990f3d';
    window.circle.style.fill = '#f2dfce';
  }
}
initProgressCircle();

// MARK: Update Time Stamp for different time zones and archived pages. This is useful in all type of pages. 
(function(){
  try {
    var attributeName = 'data-time';
    var allTimeStamps = document.querySelectorAll('[' + attributeName + ']');
    for (var i=0; i<allTimeStamps.length; i++) {
      var ele = allTimeStamps[i];
      var timeValue = ele.getAttribute(attributeName);
      if (timeValue === undefined || timeValue === '') {
        ele.innerHTML = '';
        continue;
      }
      var pubdate = parseInt(timeValue, 10);
      if (pubdate.isNaN) {
        ele.innerHTML = '';
        continue;
      }
      var date = new Date();
      var nowDate = date.getTime() / 1000;
      var timeDiff = nowDate - pubdate;
      var currentTime = ele.innerHTML;
      var newTime = currentTime;
      if (timeDiff < 0) {return;}
      var theDate = new Date(pubdate * 1000);
      var year = theDate.getFullYear();
      var month = theDate.getMonth() + 1;
      var day = theDate.getDate();
      var pad = '00';
      var hour = (pad + theDate.getHours()).slice(-pad.length);
      var minute = (pad + theDate.getMinutes()).slice(-pad.length);
      if (ele.className === 'story-time') {
        var prefix = (currentTime.indexOf('更新于') >= 0) ? currentTime.replace(/(更新于).*$/g, '$1') : '发布于';
        newTime = prefix + year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute;
      } else if (timeDiff < 60 * 60) {
        var minutes = Math.floor(timeDiff / 60);
        newTime = minutes + '分钟前';
      } else if (timeDiff < 60 * 60 * 24) {
        var hours = Math.floor(timeDiff / 3600);
        newTime = hours + '小时前';
      } else if (timeDiff < 60 * 60 * 24 * 7) {
        var days = Math.floor(timeDiff / 86400);
        newTime = days + '天前';
      } else {
        newTime = year + '年' + month + '月' + day + '日';
      }
      if (newTime !== currentTime) {
        ele.innerHTML = newTime;
      }
    }
  } catch(ignore) {}
})();

function updateStickyRightRail() {
  // MARK: - If the oAds is not an object yet, check again in 0.5 second
  document.body.classList.add('mpu-right1-empty');
  if (typeof oAds !== 'object') {
    setTimeout(function(){
      updateStickyRightRail();
    }, 500);
    return;
  }
  // MARK: - Only need to check if these two ads are rendered
  var neededAds = ['mpu-right1', 'ribbon', 'mpu-right2'];
  // MARK: - Update the sticky header only once
  var updatedSticky = false;
  document.body.addEventListener('oAds.rendered',function(e){
    if (!e.detail || updatedSticky) {return;}
    for (var i=0; i<neededAds.length; i++) {
      if (e.detail.name === neededAds[i]) {
        neededAds.splice(i, 1);
        break;
      }
    }
    if (neededAds.length > 0) {return;}
    var homerightRail = document.querySelector('.home-right-rail-page');
    if (!homerightRail) {return;}    
    var homerightRailTop = parseInt(window.getComputedStyle(homerightRail).getPropertyValue('top').replace(/px/, ''), 10);
    var interactiveContainer = homerightRail.querySelector('.ft-academy-container');
    if (!interactiveContainer) {return;}
    var homerightRailOffsetTop = interactiveContainer.parentElement.children[0].offsetTop;
    var interactiveContainerOffsetTop = interactiveContainer.offsetTop;
    var interactiveContainerOffsetHeight = interactiveContainerOffsetTop - homerightRailOffsetTop;
    if (interactiveContainerOffsetHeight <= 0) {return;}
    var stickyTopAfterAdRender = homerightRailTop - interactiveContainerOffsetHeight;
    homerightRail.style.top = stickyTopAfterAdRender + 'px';
    updatedSticky = true;
  }, false);
}

updateStickyRightRail();

// MARK: Kickout users that are sharing accounts
(function(){
  try {
    if (!window.userId) {return;}
    var ua = navigator.userAgent || navigator.vendor || '';
    var deviceType = 'web';
    if (/iphone|android/gi.test(ua)) {
      deviceType = 'phone';
    } else if (/iphone|android/gi.test(ua)) {
      deviceType = 'pad';
    }
    var uniqueId = GetCookie('uniqueVisitorId') || guid();
    // MARK: - Set Cookie to expire in 100 days
    SetCookie('uniqueVisitorId',uniqueId,86400*100,'/');
    console.log(uniqueId);
    var xhr = new XMLHttpRequest();
    var message = {
      user_id: window.userId, 
      device_id: uniqueId, 
      action: 'view', 
      platform: deviceType
    };
    xhr.open('POST', '/users/online');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status !== 200) {return;}
          var data = JSON.parse(xhr.responseText);
          var ec = 'AccountShare';
          var ea = data.online === 1 ? 'Allow' : 'Kickout';
          ea = 'View ' + ea;
          el = window.userId + ':' + uniqueId;
          gtag('event', ea, {'event_label': number, 'event_category': ec, 'non_interaction': true});
    };
    xhr.send(JSON.stringify(message));
  } catch(err) {
    console.log(err);
  }
})();
