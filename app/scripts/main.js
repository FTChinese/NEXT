/* jshint devel:true */
var containerTop = [];
var mainHeight = [];
var sideHeight = [];
var bodyHeight;
var gNavOffsetY=0;
var gNavHeight = 44;
var gShareOffsetY;
var gAudioOffsetY;
var gRecomendOffsetY;
var gRecomendInViewNoted = false;
//  var gShareHeight = 38;
var defaultPadding = 30;
var hasSideWidth = 690;
var sectionsWithSide = document.querySelectorAll('.block-container.has-side');
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





function findTop(obj) {
  var curtop = 0;
  if (obj.offsetParent) {
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
      //console.log (theContainer.className);
    }
  }
}

// {
//       'BannerId': parentId,
//       'stickyHeight': stickyHeight
//   }

function stickyBottomPrepare() {
  gNavOffsetY = findTop(document.querySelector('.o-nav__placeholder'));
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

  w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  // console.log (w);
  //     console.log (hasSideWidth); 
  if (sectionsWithSide.length > 0) {

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

}

function stickyBottomUpdate() {





  var htmlClassNew = htmlClass.replace(/( o-nav-sticky)|( tool-sticky)|( audio-sticky)/g, '');
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(stickyBottomUpdate);
  }
  //sticky navigation
  if (typeof gShareOffsetY === 'number' && gShareOffsetY > gNavOffsetY) {
    if (scrollTop >= gShareOffsetY) {
      htmlClassNew += ' tool-sticky';
    } else if (scrollTop >= gNavHeight) {
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
        //console.log (sectionClassName[i]);
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
      if (window.FTStoryid === undefined) {
        window.FTStoryid = '';
      }
      ga('send','event','Story Recommend', 'Seen', FTStoryid, {'nonInteraction':1});
      gRecomendInViewNoted = true;
      //console.log ('in view');
    }
  }
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


// load responsive images
function loadImages() {
  var figures = document.querySelectorAll('figure.loading');
  var i;
  var queryString = window.location.search;
  var isFrenquentDevice = false;
  var MULTIPLE = 100;
  try {
    if (w === 360 || w === 375 || w === 320 || w === 414 || w === 768 || w === 1024 || w>1220) {
      isFrenquentDevice = true;
    }
  } catch (ignore) {

  }
  for (i=0; i<figures.length; i++) {
    var thisFigure = figures[i];
    var imageWidth = thisFigure.offsetWidth;
    var imageHeight = thisFigure.offsetHeight;
    var imageUrl = thisFigure.getAttribute('data-url');
    var imageUrlBack;
    var figureClass = thisFigure.className || '';
    var fitType = 'cover';
    var figureParentClass = thisFigure.parentNode.className || '';
    var shouldLoadImage = false;
    var loadedClass = '';
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
    // imageWidth = parseInt (imageWidth, 10);
    // imageHeight = parseInt (imageHeight, 10);
    if (/brand/.test(figureParentClass)) {
      fitType = 'contain';
    }
    imageUrl = encodeURIComponent(imageUrl);
    if (/sponsor/.test(figureClass)) {
      imageUrl = 'http://image.webservices.ft.com/v1/images/raw/' + imageUrl + '?source=ftchinese&height=' + imageHeight + '&fit=' + fitType;
      shouldLoadImage = true;
    } else if (imageWidth > 0 && imageHeight > 0) {
      imageUrl = 'http://image.webservices.ft.com/v1/images/raw/' + imageUrl + '?source=ftchinese&width=' + imageWidth + '&height=' + imageHeight + '&fit=' + fitType;
      shouldLoadImage = true;
    }
    if (shouldLoadImage === true) {
      imageUrlBack = imageUrl.replace('i.ftimg.net', 'i.ftmailbox.com');
      //thisFigure.innerHTML = '<img src="' + imageUrl + '" data-backupimage="' + imageUrlBack + '" style="width: '+imageWidth+'px; height: '+imageHeight+'px">';
      thisFigure.innerHTML = '<img src="' + imageUrl + '" data-backupimage="' + imageUrlBack + '">';
      //thisFigure.style.backgroundImage = 'url("'+ imageUrl+'")';
      thisFigure.className = loadedClass;
    }
  }


  // load responsive videos
  var videos = document.querySelectorAll('figure.loading-video');
  hostForVideo = '';
  if (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168') === 0 || window.location.hostname.indexOf('10.113') === 0 || window.location.hostname.indexOf('127.0') === 0) {
    hostForVideo = 'http://www.ftchinese.com';
  }
  for (i=0; i<videos.length; i++) {
    var thisVideo = videos[i];
    var videoWidth = thisVideo.offsetWidth;
    var videoHeight = thisVideo.offsetHeight;
    var videoId = thisVideo.getAttribute('data-vid');
    var videoType = thisVideo.getAttribute('data-item-type') || 'video';
    if (videoWidth > 0 && videoHeight > 0 && queryString.indexOf('?ad=no') === -1 && hostForVideo !== 'http://www.ftchinese.com') {
      //console.log (videoId + ' Height: ' + videoHeight + ' Width: ' + videoWidth);
      thisVideo.innerHTML = '<iframe name="video-frame" id="video-frame" style="width:100%;height:100%;position:absolute;" src="' + hostForVideo + '/' + videoType + '/'+ videoId +'?i=2&w='+videoWidth+'&h='+videoHeight+'&autostart=false" scrolling="no" frameborder="0" allowfullscreen=true></iframe>';
      thisVideo.className = '';
    }
  }
}

function setResizeClass() {
  if (htmlClass.indexOf(' resized') < 0) {
    htmlClass += ' resized';
    document.documentElement.className = htmlClass;
  }
}


try {
  delegate = new Delegate(document.body);
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
// console.log (gAudioOffsetY);
// disable sticky scroll on touch devices
if ((gNavOffsetY > 30 && w > 490 && isTouchDevice() === false) || document.getElementById('audio-placeholder')) {
  try {
    stickyBottomPrepare();
    stickyAdsPrepare();


    // if (isTouchDevice() === true) {
    //   addEvent('touchmove', function() {
    //     stickyBottom();
    //   });
    //   addEvent('touchend', function() {
    //     stickyBottom();
    //   });
    // }
    addEvent(eventScroll, function(){
        stickyBottom();
    });
    addEvent(eventResize, function(){
        stickyBottomPrepare();
        stickyAdsPrepare();
        reloadBanners();
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
  addEvent(eventResize, function(){
      reloadBanners();
      loadImages();
      setResizeClass();
  });
}

// check svg support
// SVG is default, no-svg is exception
if (typeof SVGRect === 'undefined') {
  document.documentElement.className += ' no-svg';
}

loadImages();


//A cool trick to handle images that fail to load:
try {
  delegate.on('error', 'img', function(){
    var backupImg = this.getAttribute('data-backupimage') || '';
    if (backupImg !== '') {
      this.setAttribute('data-backupimage', '');
      this.src = backupImg;
    } else {
      this.style.display = 'none';
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
      ga('send','event',ec, ea, el);
      //console.log (ec + ea + el);
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