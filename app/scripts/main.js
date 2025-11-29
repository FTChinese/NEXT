/* jshint devel:true */
/* exported gThereIsUluAd, ftItemId, checkInView, isRetinaDevice, figures, figuresLazy, figuresLoadStatus, videos, videosLazy, videosLoadStatus, runLoadImages, loadImages, loadImagesLazy, loadVideosLazy */
/* global SetCookie, GetCookie, guid, oAds, inreadAd, showInreadAd, recommendInner, isTouchDevice, gaMeasurementId, gtag, Delegate, showOverlay, convertChinese, preferredLanguage, Android, webkit, closeOverlay */

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
var figureImageSelector = 'figure.loading, figure.loading-video-image[data-url]';
var videoFramePlaySelector = 'figure.loading-video';
var figures = document.querySelectorAll(figureImageSelector);
var figuresLazy = [];
var figuresLoadStatus = 0;
var videos = document.querySelectorAll(videoFramePlaySelector);
var videosLazy = [];
var videosLoadStatus = 0;
var viewables = [];//存储要记录track In View的元素

// Make width global and explicit
window.w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

function findTop(obj) {
  var curtop = 0;
  if (obj && obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    return curtop;
  }
  return null;
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

// (Deprecated) Lazy-load images/videos via scroll math — removed.
// Replaced with IntersectionObserver-based logic further below.

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

// ==============================
// IntersectionObserver Lazy Media
// ==============================

// Preload ~two viewports ahead (matches old `bodyHeight * 2` heuristic)
const IO_ROOT_MARGIN = '200% 0px';
const IO_THRESHOLD = 0;

// Respect existing data saver rule
function isDataSaverOn() {
  try {
    return window.gNoImageWithData === 'On' && window.gConnectionType === 'data';
  } catch (e) {
    return false;
  }
}

// Build image service URLs (preserves your previous logic)
function buildImageRequest(figureEl) {
  const isRetina = (window.devicePixelRatio || 1) > 1;
  const qs = window.location.search || '';
  let imageWidth = figureEl.offsetWidth || figureEl.getBoundingClientRect().width || 0;
  let imageHeight = figureEl.offsetHeight || figureEl.getBoundingClientRect().height || 0;
  let imageUrl = figureEl.getAttribute('data-url') || '';
  let loadedClass = '';
  const figureClass = figureEl.className || '';
  const figureParentClass = figureEl.parentNode && figureEl.parentNode.className || '';
  let fitType = /brand/.test(figureParentClass) ? 'contain' : 'cover';

  const imageServiceHost = 'https://images.ft.com/v3/image/raw/';
  const imageServiceHostFTC = 'https://d1sh1cgb4xvhl.cloudfront.net/unsafe/';
  const ftcStaticServer = 'https://d1sh1cgb4xvhl.cloudfront.net/unsafe/';

  if (!imageUrl) { return null; }

  if (isRetina) {
    imageWidth *= 2;
    imageHeight *= 2;
    loadedClass = 'is-retina';
  }

  // Snap width to 100px multiples when ad param isn't present
  if ((!qs || qs.indexOf('?ad=no') === -1)) {
    const MULTIPLE = 100;
    const mod = imageWidth % MULTIPLE;
    if (mod !== 0 && imageWidth > 0 && imageHeight > 0) {
      const ratio = imageHeight / imageWidth;
      const q = parseInt(imageWidth / MULTIPLE, 10);
      imageWidth = (q + 1) * MULTIPLE;
      imageHeight = parseInt(imageWidth * ratio, 10);
      loadedClass = 'is-retina';
    }
  }

  // Normalize incoming URL (already service vs raw)
  if (imageUrl.indexOf(imageServiceHost) >= 0) {
    imageUrl = decodeURIComponent(imageUrl.replace(imageServiceHost, '').replace(/\?.*$/g, ''));
  } else if (imageUrl.indexOf(imageServiceHostFTC) >= 0) {
    imageUrl = imageUrl
      .replace(imageServiceHostFTC, '')
      .replace(/^[0-9x]+\//g, '')
      .replace(/^(picture)/g, ftcStaticServer + '$1');
  }

  // Backup URL via Origami
  let imageUrlBack = imageUrl;
  if (/^\/picture\//.test(imageUrlBack)) {
    imageUrlBack = 'https://dq4atoxl7csa1.cloudfront.net/unsafe' + imageUrlBack;
  }
  imageUrlBack = encodeURIComponent(imageUrlBack);

  const imageUrlPart = imageUrl.replace(/^(https:\/\/.+\/unsafe\/)/g, '').replace(/^\//, '');

  let finalUrl = '';
  let finalBackup = '';

  if (imageUrl.indexOf('bokecc.com') >= 0) {
    finalBackup = 'https://images.ft.com/v3/image/raw/' + imageUrlBack + '?source=ftchinese&width=' + imageWidth + '&height=' + imageHeight + '&fit=' + fitType;
    finalUrl = finalBackup;
  } else if (/sponsor|logo/.test(figureClass)) {
    finalUrl = imageServiceHostFTC + '0x' + imageHeight + '/' + imageUrlPart;
    finalBackup = 'https://images.ft.com/v3/image/raw/' + imageUrlBack + '?source=ftchinese&height=' + imageHeight + '&fit=' + fitType;
  } else if (imageWidth > 0 && imageHeight > 0) {
    finalUrl = imageServiceHostFTC + imageWidth + 'x' + imageHeight + '/' + imageUrlPart;
    finalBackup = 'https://images.ft.com/v3/image/raw/' + imageUrlBack + '?source=ftchinese&width=' + imageWidth + '&height=' + imageHeight + '&fit=' + fitType;
  } else {
    return null; // cannot size → skip
  }


  console.log(`image url: ${imageUrl}, final: ${finalUrl}`);

  return { finalUrl: finalUrl, finalBackup: finalBackup, loadedClass: loadedClass, fitType: fitType };
}

function loadFigureNow(figureEl) {
  var req = buildImageRequest(figureEl);
  if (!req) { return; }

  // Special case: story hero uses background-image
  if (
    figureEl.parentElement &&
    figureEl.parentElement.classList &&
    figureEl.parentElement.classList.contains('story-hero-image')
  ) {
    figureEl.style.backgroundImage = 'url(' + req.finalUrl + ')';
    figureEl.classList.remove('loading');     // <-- always clear loading
    figureEl.setAttribute('data-loaded', 'yes');
    return;
  }

  // Reuse existing <img> if present; otherwise create one
  var img = figureEl.querySelector('img') || document.createElement('img');

  img.setAttribute('data-backupimage', req.finalBackup);

  // Only update src if different (avoids pointless reflows)
  if (img.src !== req.finalUrl) {
    img.src = req.finalUrl;
  }

  if (!img.parentNode) {
    figureEl.appendChild(img);
  }

  // Always drop the .loading flag so future scans don’t pick it up again
  figureEl.classList.remove('loading');
  if (req.loadedClass) {
    figureEl.classList.add(req.loadedClass);
  }

  // 5s backup swap (unchanged)
  setTimeout(function(){
    var isLoaded = img.complete;
    var backup = img.getAttribute('data-backupimage') || '';
    var reloaded = img.getAttribute('data-reloaded') || '';
    if (!isLoaded && backup && reloaded !== 'yes') {
      img.src = backup;
      img.setAttribute('data-reloaded', 'yes');
    }
  }, 5000);
}



function loadVideoNow(videoFigure) {
  var qs = window.location.search || '';
  if (qs.indexOf('ad=no') !== -1) { return; } // more robust match

  var videoWidth  = videoFigure.offsetWidth || videoFigure.getBoundingClientRect().width  || 0;
  var videoHeight = videoFigure.offsetHeight || videoFigure.getBoundingClientRect().height || 0;
  var videoId     = videoFigure.getAttribute('data-vid');
  var itemType    = videoFigure.getAttribute('data-type') || videoFigure.getAttribute('data-item-type') || 'video';
  var thirdParty  = videoFigure.getAttribute('data-third-party-frame-url');
  var ccVid       = videoFigure.getAttribute('data-cc-vid') || '';
  var autoStart   = videoFigure.getAttribute('data-autoplay') || '';
  var videoWall   = '';

  if (autoStart === 'yes') {
    autoStart = 'true';
    videoWall = '&videowall=yes';
  } else {
    autoStart = 'false';
  }

  // NOTE: use the global hostForVideo; don't shadow it here
  // var hostForVideo = ''; // <-- remove this line if it exists in your code

  // Build the desired src and a selector to find the existing iframe
  var desiredSrc = '';
  var findExisting;

  if (thirdParty) {
    desiredSrc = thirdParty;
    findExisting = function() {
      // any iframe whose src starts with the third-party url
      var ifr = videoFigure.querySelector('iframe');
      return (ifr && ifr.src && ifr.src.indexOf(thirdParty) === 0) ? ifr : null;
    };
  } else if (ccVid !== '') {
    desiredSrc = 'https://p.bokecc.com/playhtml.bo?vid=' + ccVid + '&siteid=922662811F1A49E9&autoStart=false';
    findExisting = function() {
      return videoFigure.querySelector('#cciframe_' + ccVid) || null;
    };
  } else if (videoId && videoWidth > 0 && videoHeight > 0) {
    desiredSrc = (hostForVideo || '') + '/' + itemType + '/' + videoId +
      '?i=2&w=' + videoWidth + '&h=' + videoHeight + '&autostart=' + autoStart + videoWall;
    findExisting = function() {
      // prefer the one we manage (name="video-frame")
      return videoFigure.querySelector('iframe[name="video-frame"]') || null;
    };
  } else {
    return; // not enough info
  }

  var iframe = findExisting();

  if (!iframe) {
    // Create once
    if (ccVid !== '') {
      iframe = document.createElement('iframe');
      iframe.id = 'cciframe_' + ccVid;
      iframe.frameBorder = '0';
      iframe.style.position = 'absolute';
    } else {
      iframe = document.createElement('iframe');
      iframe.name = 'video-frame';
      iframe.id = 'video-frame'; // note: multiple identical IDs across the page aren’t ideal, but kept for back-compat
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.position = 'absolute';
    }
    iframe.style.width  = '100%';
    iframe.style.height = '100%';
    // width/height attributes used by some providers:
    iframe.width  = String(videoWidth);
    iframe.height = String(videoHeight);
    iframe.src = desiredSrc;

    // Append without clobbering other children
    // (If you *know* the figure contains only the iframe, you could set innerHTML, but that causes reloads.)
    videoFigure.appendChild(iframe);
  } else {
    // Update only if changed
    if (iframe.src !== desiredSrc) {
      iframe.src = desiredSrc;
    }
    // Keep size in sync without rebuilding
    iframe.width  = String(videoWidth);
    iframe.height = String(videoHeight);
    iframe.style.width  = '100%';
    iframe.style.height = '100%';
  }

  // Mark as processed to avoid repeated work
  videoFigure.classList.remove('loading-video');
  videoFigure.setAttribute('data-loaded', 'yes');
}


function observeFiguresAndVideos() {
  var figNodes = document.querySelectorAll(figureImageSelector);
  var vidNodes = document.querySelectorAll(videoFramePlaySelector);

  // Data saver: do nothing
  if (isDataSaverOn()) { return; }

  // Fallback: no IO → eager-load everything (images + videos)
  if (!('IntersectionObserver' in window)) {
    for (var i=0; i<figNodes.length; i++) { loadFigureNow(figNodes[i]); }
    for (var j=0; j<vidNodes.length; j++) { loadVideoNow(vidNodes[j]); }
    return;
  }

  // IO for images
  var imgObserver = new IntersectionObserver(function(entries, obs){
    for (var i=0; i<entries.length; i++) {
      var entry = entries[i];
      if (!entry.isIntersecting) { continue; }
      loadFigureNow(entry.target);
      obs.unobserve(entry.target);
    }
  }, { root: null, rootMargin: IO_ROOT_MARGIN, threshold: IO_THRESHOLD });

  for (var f=0; f<figNodes.length; f++) { imgObserver.observe(figNodes[f]); }

  // IO for videos
  var videoObserver = new IntersectionObserver(function(entries, obs){
    for (var i=0; i<entries.length; i++) {
      var entry = entries[i];
      if (!entry.isIntersecting) { continue; }
      loadVideoNow(entry.target);
      obs.unobserve(entry.target);
    }
  }, { root: null, rootMargin: IO_ROOT_MARGIN, threshold: IO_THRESHOLD });

  for (var v=0; v<vidNodes.length; v++) { videoObserver.observe(vidNodes[v]); }
}

// Public init to call once (replaces previous loadImages() call)
function initLazyMedia() {
  try {
    observeFiguresAndVideos();
  } catch (e) {
    // Last resort: don't break media
    if (!isDataSaverOn()) {
      var figNodes = document.querySelectorAll(figureImageSelector);
      var vidNodes = document.querySelectorAll(videoFramePlaySelector);
      for (var i=0; i<figNodes.length; i++) { loadFigureNow(figNodes[i]); }
      for (var j=0; j<vidNodes.length; j++) { loadVideoNow(vidNodes[j]); }
    }
  }
}

// ---- Back-compat shims for legacy callers ----
function runLoadImages() {
  // mirror old behavior: trigger (re)scan + keep any analytics pulse
  initLazyMedia();
  try { trackViewables(); } catch (e) {}
}
function loadImages() { initLazyMedia(); }
function loadImagesLazy() { /* no-op; IO handles timing */ }
function loadVideosLazy() { /* no-op; IO handles timing */ }

// ==============================
// End IO Lazy Media
// ==============================

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

      // MARK:When in-story-recommend has changed to the Ad, change the id to 'instroyAd' 
      if(sectionType === 'in-story-recommend') {
        if(window.gReplacedInstroyWithAd && viewables[j]) {
          // textIndex was undefined previously; use a stable id
          viewables[j].id = 'instoryAd';
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

  var storyBodyContainer = document.querySelector('#story-body-container, .block-container .story-container');
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

  // Update global width safely
  window.w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (sectionsWithSide && sectionsWithSide.length > 0) {
    for (var i=0; i<sectionsWithSide.length; i++) {
      sectionClassName[i] = sectionsWithSide[i].className;       
      if (window.w < hasSideWidth) {
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
        sideHeight[i] = sectionsWithSide[i].querySelector('.side-inner')?.offsetHeight ?? 0 + defaultPadding;
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
  // MARK: - There might be multiple story-container
  var storyTools = document.querySelector('.story-container .story-tools');
  if (!storyTools) {return;}
  var storyContainer = storyTools.closest('.story-container');
  if (!storyContainer) {return;}
  storyContainer.classList.add('show-sticky-tools');
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
  if (sectionsWithSideLength > 0 && window.w > hasSideWidth) {
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
      if (window.ftItemId === undefined) {
        window.ftItemId = '';
      }
      gRecomendInViewNoted = true;
    }
  }

  // IO handles media; no need to call lazy loaders here
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
      if (typeof webkit === 'object') {
        webkit.messageHandlers.qualityread.postMessage(info);
      } else if (typeof Android === 'object') {
        Android.qualityread(JSON.stringify(info));
      }
    } catch (ignore) {}
    var el = window.privilegeEventLabel || ftItemId;
    var parameters = {'send_page_view': false};
    parameters[metricName] = 1;
    gtag('config', gaMeasurementId, parameters);
    gtag('event', ea, {'event_label': el, 'event_category': 'Quality Read'});
    window[ea] = true;
  }
}

function trackQualityRead() {
  if (gStoryBodyBottomOffsetY === undefined) {
    return;
  }
  var storyScrollDistance = gStoryBodyBottomOffsetY - bodyHeight;
  if (storyScrollDistance > 0) {
    if (scrollTop >= storyScrollDistance/2) {
      trackRead('Read To Half', 'read_to_half');
    }
    var scrollPercentage = parseInt(100 * scrollTop / storyScrollDistance, 10);
    setProgress(scrollPercentage, scrollTop, storyScrollDistance);
  }
}

function checkFullGridItem() {
  try {
    if (!document.querySelector('.full-grid-story')) {return;}
    var fullGridItems = document.querySelectorAll('[data-layout-width="full-grid"], blockquote, .n-content-big-number, [data-table-layout-largescreen="full-grid"]');
    var bodyHeight = getBodyHeight();
    var isFullGridItemInView = false;
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

function checkScrollyTelling() {
  try {
    if (!document.querySelector('.scrollable-block')) {return;}
    var scrollableSlides = document.querySelectorAll('.scrollable-slide, .scrollable-slide-info');
    var bodyHeight = getBodyHeight();
    var firstScrollableSlidesInView;
    for (var i=0; i<scrollableSlides.length; i++) {
      var itemHeight = scrollableSlides[i].offsetHeight;
      var itemTop = findTop(scrollableSlides[i]);
      var isScrollableSlideInView = (scrollTop + bodyHeight >= itemTop && itemTop + itemHeight >= scrollTop);
      if (isScrollableSlideInView) {
        firstScrollableSlidesInView = scrollableSlides[i];
        var slideId = firstScrollableSlidesInView.getAttribute('data-id');
        var currentBlock = firstScrollableSlidesInView.closest('.scrollable-block');
        var currentImages = currentBlock.querySelectorAll('.scrolly-telling-viewport figure, .scrolly-telling-viewport picture');
        for (var j=0; j<currentImages.length; j++) {
          var imageId = j.toString();
          if (imageId === slideId) {
            currentImages[j].classList.add('visible');
          } else {
            currentImages[j].classList.remove('visible');
          }
        }
        break;
      }
    }

  } catch (ignore){}
}

function checkInreadAd() {
  if (typeof inreadAd !== 'object') {return;}
  if (inreadAd.h >0 && inreadAd.t >0 && inreadAd.displayed === false) {
      if (scrollTop + bodyHeight > inreadAd.t + inreadAd.h) {
        showInreadAd();
      }
  }
}

function renderVideoPackagePlay(ele) {
  var videoWidth = ele.offsetWidth;
  var videoHeight = ele.offsetHeight;
  var vid = ele.getAttribute('data-vid');
  var ccVid = ele.getAttribute('data-cc-vid');
  var link = '/video/' + vid;
  link = link.replace(/#.*$/g,'');
  var src = link  +'?i=2&k=1&w='+videoWidth+'&h='+videoHeight+'&autostart=true';

  if (ccVid) {
    ele.innerHTML = '<iframe style="position:absolute" id="cciframe_' + ccVid + '" src="https://p.bokecc.com/playhtml.bo?vid=' + ccVid + '&siteid=922662811F1A49E9&autoStart=true" frameborder="0" width="' + videoWidth + '" height="' + videoHeight + '"></iframe>';
  } else {
    ele.innerHTML = '<iframe name="video-frame" id="video-frame" style="width:100%;height:100%;position:absolute;" src="' + src + '" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>';
  }

  var videoContainer = ele.closest('.is-video');
  if (videoContainer) {
    videoContainer.classList.remove('is-video');
  }
}

if (typeof Delegate === 'function') {
  if (!(window.delegate instanceof Delegate)) {
    try {
      window.delegate = new Delegate(document.body);
    } catch (err) {
      console.error('Delegate init failed — is body available?', err);
    }
  }
} else {
  console.error('Delegate is not defined — did you forget to include it?');
}

try {
  validHTMLCode();
} catch (ignore) {

}

// MARK: - get the top of navigation
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
if (gNavOffsetY > 30 && window.w > 490 && supportStickyPosition === false) {
  try {
    stickyBottomPrepare();
    stickyAdsPrepare();
    addEvent(eventScroll, function(){
        stickyBottom();
        trackViewables();
        checkFullGridItem();
        checkScrollyTelling();
        checkInreadAd();
        // IO handles media; nothing needed here
    });
    addEvent(eventResize, function(){
        stickyBottomPrepare();
        stickyAdsPrepare();
        setResizeClass();
        // Re-scan for any newly added lazy media on resize
        initLazyMedia();
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
      // Update global width on resize
      window.w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      // Re-scan for any newly added lazy media on resize
      initLazyMedia();
      setResizeClass();
  });
  addEvent(eventScroll, function(){
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      // IO handles media; nothing needed here
      trackViewables();
      checkFullGridItem();
      checkScrollyTelling();
      checkInreadAd();
  });
}

// check svg support
// SVG is default, no-svg is exception
if (typeof SVGRect === 'undefined') {
  document.documentElement.className += ' no-svg';
}

// MARK: init lazy media (replaces loadImages)
initLazyMedia();
viewablesInit();

// MARK: - Sometimes init just doesn't fire as we expected.
// Keep a light rescan to deal with late DOM changes near top.
var refreshTimes = [1000, 3000, 5000, 10000, 20000];
for (var i=0; i<refreshTimes.length; i++) {
    setTimeout(function(){initLazyMedia();}, refreshTimes[i]);
}

// MARK: - A cool trick to handle images that fail to load
try {
  delegate.on('error', 'img', function(){
    const src = this.getAttribute('src') ?? '';
    if ( src === '') {
      return;
    }
    var backupImg = this.getAttribute('data-backupimage') || '';
    if (backupImg !== '') {
      this.setAttribute('data-backupimage', '');
      this.src = backupImg;
      this.setAttribute('data-failed-1', src);
    } else {
      this.setAttribute('data-hide-image-reason', 'failed to load');
      this.style.display = 'none';
      this.setAttribute('data-failed-2', src);
    }
  });
} catch (ignore) {

}

// click events
try {
  delegate.on('click', '.video-package .XL2 a.image', function(){
    var link = hostForVideo + this.getAttribute('href');
    var videoPackage = this.parentNode.parentNode.parentNode;
    var videoEle = videoPackage.querySelector('#video-package-play');
    if (!videoEle) {return;}
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
    var videoPlayingFrame = videoEle.querySelector('iframe');
    var src = link  +'?i=2&k=1&w='+videoWidth+'&h='+videoHeight+'&autostart=true';
    if (videoPlayingFrame) {
      videoEle.querySelector('iframe').src = src;
    } else {
      videoEle.innerHTML = '<iframe name="video-frame" id="video-frame" style="width:100%;height:100%;position:absolute;" src="' + src + '" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>';
    }
    videoPackage.querySelector('.video-package-title a').innerHTML = thisHeadline;
    videoPackage.querySelector('.video-package-title a').href = link;
    return false;
  });
  
  delegate.on('click', '.overlay', function(e){
    if (e.target.className === 'cell') {
      closeOverlay();
    }
  });

  delegate.on('click', '#video-package-play', function(){
    renderVideoPackagePlay(this);
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

// MARK: - save content
delegate.on('click', '.icon-save button', async function() {
  if (this.classList.contains('save_content_button')) {
    // MARK: - New code block
    const action = this.classList.contains('saved') ? 'unsave' : 'save';
    const id = this.getAttribute('data-item-id');
    const type = this.getAttribute('data-item-type');
    if (!id || !type) {
      return;
    }
    // Set initial loading state for visual feedback
    const originalText = this.innerHTML;
    this.innerHTML = '...';
    this.disabled = true;  // Disable button to prevent multiple clicks

    try {
      // Send a POST request to the /save_content endpoint
      const response = await fetch('/save_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          type: type,
          action: action,
        }),
      });

      if (response.ok) {
        // Successfully saved or unsaved; toggle the button state
        this.classList.toggle('saved');
        this.innerHTML = (action === 'save') ? await convertChinese('删除', preferredLanguage) : await convertChinese('收藏', preferredLanguage);
      } else {
        console.error(`Failed to ${action} content. Status: ${response.status}`);
        this.innerHTML = originalText;  // Revert to original text on error
        alert(await convertChinese('操作失败，请稍后再试。', preferredLanguage));
      }
    } catch (error) {
      console.error('Error saving content:', error);
      this.innerHTML = originalText;  // Revert to original text on error
      alert(await convertChinese('发生错误，请检查您的网络连接并重试。', preferredLanguage));
    } finally {
      this.disabled = false;  // Re-enable button after request completes
    }
    return;
  }

  // MARK: - The following code can be removed after July 1st, 2025
  if (window.username === '' || window.username === null) {
    alert('您必须登录后能才能收藏文章!');
    return;
  }
  var id = this.id.replace(/addfavlink/g, '');
  var itemType = this.getAttribute('data-item-type') || 'story';
  var favAction;
  if (this.innerHTML === '收藏') {
    favAction = 'add';
  } else if (this.innerHTML === '删除') {
    favAction = 'remove';
  } else {
    return;
  }

  currentFavButton = document.getElementById('addfavlink' + id) || document.getElementById('addfavlink');
  currentFavButton.innerHTML = (favAction === 'add') ? '保存...' : '删除...';

  var xhr1 = new XMLHttpRequest();
  xhr1.open('POST', '/users/' + favAction + 'favstory/' + id);
  xhr1.setRequestHeader('Content-Type', 'application/text');
  xhr1.onload = function() {
    if (xhr1.status === 200) {
      var data = xhr1.responseText;
      if (data === 'ok' || data === '' || data.indexOf('ok') === 0) {
        currentFavButton.innerHTML = (favAction === 'add') ? '删除' : '收藏';
      }
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

delegate.on('click', '.switch_preferred_chinese_language', function(){

  window.preferredLanguage = this.getAttribute('data-language');
  let myPreference = getMyPreference() ?? {};
  myPreference.Language = window.preferredLanguage;
  SetCookie('preferredLanguage', window.preferredLanguage);
  myPreference.time = new Date();
  localStorage.setItem('preference', JSON.stringify(myPreference));
  window.location.reload();

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
          itemLeads[i].innerHTML = '<a target="_blank" href="' + link + '">' + itemLeads[i].innerHTML + '</div>';
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

function setProgress(percent, scrollTop = 0, storyScrollDistance = 0) {
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

  const actionEle = document.querySelector('.story-action');
  if (actionEle) {
    if (percent > 100) {
      if (storyScrollDistance > 0 && scrollTop > storyScrollDistance) {
        const scrollExtra = scrollTop - storyScrollDistance;
        const maxScrollExtra = 200;
        let opacity = Math.max(0, (maxScrollExtra - scrollExtra)/maxScrollExtra);
        actionEle.style.opacity = opacity;
      }
    } else {
      actionEle.style.opacity = 1;
    }
  }

  const watchProgress = document.querySelector('.progress-watch-minute');
  if (watchProgress) {
    const rotation = (percent / 100) * 360;
    watchProgress.style.transform = `rotate(${rotation}deg)`;
  }

}

function initProgressCircle() {
  try {
    window.circle = document.querySelector('circle');
    if (window.circle === null || window.circle === undefined) {return;}
    var radius = window.circle.r.baseVal.value;
    window.circumference = radius * 2 * Math.PI;
    window.circle.style.strokeDasharray = window.circumference + ' ' + window.circumference;
    window.circle.style.strokeDashoffset = window.circumference;
    setProgress(0);
    window.circle.style.stroke = '#990f3d';
    window.circle.style.fill = '#f2dfce';
  } catch(err) {
    console.log(err);
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
      if (isNaN(pubdate)) {
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

  function showOffers(offers) {
    var dict = {
      half: 'ft_win_back',
      '75': 'ft_renewal',
      '85': 'ft_discount'
    };
    var offersHTML = '';
    for (var i=0; i<offers.length; i++) {
      var section = offers[i];
      if (section.status !== 'on') {continue;}
      var discountCode = dict[section.discount];
      if (!discountCode) {continue;}
      var link = 'https://www.ftacademy.cn/subscription.html?from=' + discountCode + '&ccode=' + section.ccode + '#no_universal_links';
      offersHTML = '<div class="wx-login-container"><div class="center wx-login" style="margin-top:15px;background-color:#38747e;"><a href="' + link + '">' + section.message + '</a></div></div>';
      break;
    }
    document.getElementById('login-reason').innerHTML += offersHTML;
  }

  function logoutWithOffers(deviceType, offers, info) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState !== 4 || this.status !== 200) {return;}
        var deviceDict = {
          phone: '手机',
          web: '电脑',
          pad: '平板'
        };
        var deviceName = deviceDict[deviceType] || '设备';
        var d = document.documentElement.classList;
        d.remove('is-member');
        d.remove('is-subscriber');
        d.remove('is-premium');
        var message = {
          title: '您已登出',
          description: '您的账号已经在另一台' + deviceName + '上登入，因此在本' + deviceName + '上登出。每个账号可以在不同类的终端设备（电脑、手机和平板）上各登录一台设备，并同时使用，但不能在同类终端的两个或两个以上设备上同时登录。',
          href: window.location.href,
          offers: offers,
          info: info
        };
        if (typeof webkit === 'object') {
          webkit.messageHandlers.logout.postMessage(message);
        } else {
          showOverlay('overlay-login');
          var overlayBG = document.querySelector('.overlay-bg');
          document.getElementById('login-reason').innerHTML = message.description;
          document.querySelector('.overlay-title').innerHTML = message.title;
          document.querySelector('.wx-login').style.marginTop = '15px';
          overlayBG.className = 'overlay-bg-fixed';
          document.getElementById('ft-login-input-username').value = '';
          document.getElementById('ft-login-input-password').value = '';
          var ccode = window.ccodeValue || '';
          if (/^7S/.test(ccode)) {return;}
          showOffers(offers);
        }
    };
    var randomNumber = parseInt(Math.random()*1000000, 10);
    xmlhttp.open('GET', '/index.php/users/logout?' + randomNumber);
    xmlhttp.send();
  }

  function kickout(deviceType, info) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4 || this.status !== 200) {return;}
        var data = JSON.parse(xhr.responseText);
        logoutWithOffers(deviceType, data.sections, info);
    };
    xhr.open('GET', '/index.php/jsapi/kickoutoffers');
    xhr.send();
  }

  function checkFTCApp() {
    if (!window.location.href.includes('webview=ftcapp') && !window.location.href.includes('to=iosapp')) {return;}
    document.documentElement.classList.add('is-ftc-app');
  }

  // Since lots of pages share the same cache content between different domains, use javascript to hide elements for certain domains
  function hideNavForDomains() {
    try {
      const chinaDomains = ['www.ftmembercare.com'];
      const hostname = window?.location?.hostname ?? '';
      if (!chinaDomains.includes(hostname)) {return;}
      document.documentElement.classList.add('hide_nav');
    } catch(err) {
      console.error(`hideNavForDomains error: `);
      console.log(err);
    }
  }

  function hideHeader() {
    try {
      if (!/hideheader=yes/.test(window.location.href)) {return;}
      document.documentElement.classList.add('hide_header');
    } catch(err) {
      console.error(`hide header error: `);
      console.log(err);
    }
  }

  try {
    hideNavForDomains();
    hideHeader();
    checkFTCApp();
    // MARK: - iPhone App Use the same process as well
    if (!window.userId) {return;}
    var ua = navigator.userAgent || navigator.vendor || '';
    var deviceType = 'web';
    var isiOSNative = /AppleWebKit/.test(ua) && /Safari|Chrome/.test(ua) === false;
    if (/iphone|android/gi.test(ua)) {
      deviceType = 'phone';
    } else if (/ipad/gi.test(ua) || isiOSNative) {
      deviceType = 'pad';
    }
    var uniqueId;
    var deviceIdKey;
    if (isiOSNative) {
      // MARK: - For iOS native app, only use the device id passed from the native side
      deviceIdKey = 'iosdeviceid';
      uniqueId = GetCookie(deviceIdKey);
    } else {
      deviceIdKey = 'uniqueVisitorId';
      uniqueId = GetCookie(deviceIdKey) || guid();
    }
    if (!uniqueId || uniqueId === '') {return;}
    // MARK: - Set Cookie to expire in 100 days
    SetCookie(deviceIdKey,uniqueId,86400*100,'/');
    if (/www7\.ftchinese\.com/.test(window.location.host)) {return;}
    // MARK: - Don't kick out if users are using www7
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
        var ea = data.online === 0 ? 'Kickout' : 'Allow';
        var currentDevice = '';
        if (data.online === 0/* && doKickout*/) {
          ea = 'Kickout';
          if (data.current && typeof data.current === 'string') {
            currentDevice = ':' + data.current;
          }
          data.kicked = uniqueId;
          kickout(deviceType, data);
        }
        ea = ea + ' ' + deviceType;
        var el = window.userId + ':' + uniqueId + currentDevice;
        gtag('event', ea, {'event_label': el, 'event_category': ec, 'non_interaction': true});
        if (typeof webkit === 'object') {
          var message2 = {title: ea, message: el + ', ua: ' + ua + ', data: ' + xhr.responseText};
          webkit.messageHandlers.print.postMessage(message2);
        }
    };
    xhr.send(JSON.stringify(message));
  } catch(err) {
    console.log(err);
  }
})();

try {
  // Mark: mark the page so that after registration/login, the page will be redirected here. This is the right place to set the mark --}}
  if (!/\/(register|login|resetpassword)/gi.test(window.location.href)) {
    localStorage.setItem('pagemark', window.location.href);
  }
} catch(err) {
  console.log(err);
}
