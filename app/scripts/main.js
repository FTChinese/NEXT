/* jshint devel:true */
  var containerTop = [];
  var mainHeight = [];
  var sideHeight = [];
  var bodyHeight;
  var gNavOffsetY=0;
  var gNavHeight = 44;
  var gShareOffsetY;
//  var gShareHeight = 38;
  var defaultPadding = 30;
  var hasSideWidth = 690;
  var sectionsWithSide = document.querySelectorAll('.block-container.has-side');
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
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
      }
      //console.log (stickyAds);
    }
  }

  // {
  //       'BannerId': parentId,
  //       'stickyHeight': stickyHeight
  //   }

  function stickyBottomPrepare() {
    gNavOffsetY = findTop(document.querySelector('.o-nav__placeholder'));
    bodyHeight = getBodyHeight();
    if (document.getElementById('story-share-placeholder')) {
      gShareOffsetY = findTop(document.getElementById('story-share-placeholder'));
    }
    w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (sectionsWithSide.length > 0) {
      for (var i=0; i<sectionsWithSide.length; i++) {
        containerTop[i] = findTop(sectionsWithSide[i]);
        mainHeight[i] = sectionsWithSide[i].querySelector('.content-inner').offsetHeight;
        sideHeight[i] = sectionsWithSide[i].querySelector('.side-inner').offsetHeight + defaultPadding;
        sectionClassName[i] = sectionsWithSide[i].className;
        minHeight[i] = Math.min(mainHeight[i], sideHeight[i]);
        maxHeight[i] = Math.max(mainHeight[i], sideHeight[i]);
        //sectionsWithSide[i].querySelector('.side-inner').style.backgroundColor = 'grey';
      }
    }
  }

  function stickyBottomUpdate() {
    var htmlClassNew = htmlClass.replace(/ is-sticky/g, '').replace(/ share-sticky/g, '');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(stickyBottomUpdate);
    }

    //sticky navigation
    if (typeof gShareOffsetY === 'number' && gShareOffsetY > gNavOffsetY) {
      if (scrollTop >= gShareOffsetY) {
        htmlClassNew += ' share-sticky';
      } else if (scrollTop >= gNavHeight) {
        htmlClassNew += ' o-nav-sticky'; 
      }
      if (htmlClassNew !== htmlClass) {
        htmlClass = htmlClassNew;
        document.documentElement.className = htmlClass;
      }
    } else {
      if (scrollTop >= gNavOffsetY) {
        if (htmlClass.indexOf(' o-nav-sticky')<0) {
          htmlClass += ' o-nav-sticky';
          document.documentElement.className = htmlClass;
        }
      } else {
        if (htmlClass.indexOf(' o-nav-sticky')>=0) {
          htmlClass = htmlClass.replace(/ o-nav-sticky/g, '');
          document.documentElement.className = htmlClass;
        }
      }
    }

    // sticky sides
    if (sectionsWithSideLength > 0 && w > hasSideWidth) {
      for (var i=0; i<sectionsWithSideLength; i++) {
        sectionClassNameNew[i] = sectionClassName[i].replace(/fixmain|fixside|bottommain|bottomside|sticktop/g,'');
        var maxScroll = 0;
        var minScroll = 0;
        var stickTopClass = '';
        //console.log (i + ': ' + maxScroll + '/' + minScroll);

        if (maxHeight[i] >= bodyHeight && maxHeight[i] - minHeight[i] >= 100) {

          if (minHeight[i] < bodyHeight) {
            // when min height is less than bodyheight
            // stick to top
            stickTopClass = ' sticktop';
            maxScroll = containerTop[i] + maxHeight[i] - minHeight[i] - scrollTop - gNavHeight - defaultPadding;
            minScroll = containerTop[i] - gNavHeight - scrollTop - defaultPadding;
          } else {
            // otherwise stick to bottom
            maxScroll = containerTop[i] + maxHeight[i] - bodyHeight - scrollTop;
            minScroll = containerTop[i] + minHeight[i] - bodyHeight - scrollTop;
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
    for (i=0; i<figures.length; i++) {
      var thisFigure = figures[i];
      var imageWidth = thisFigure.offsetWidth;
      var imageHeight = thisFigure.offsetHeight;
      var imageUrl = thisFigure.getAttribute('data-url');
      var figureClass = thisFigure.className || '';
      var fitType = 'cover';
      var figureParentClass = thisFigure.parentNode.className || '';
      if (isRetinaDevice === true) {
        imageWidth = imageWidth * 2;
        imageHeight = imageHeight * 2;
      }
      if (/brand/.test(figureParentClass)) {
        fitType = 'contain';
      }
      if (/sponsor/.test(figureClass)) {
        imageUrl = imageUrl.replace('i.ftimg.net', 'i.ftmailbox.com');
        imageUrl = encodeURIComponent(imageUrl);
        imageUrl = 'https://image.webservices.ft.com/v1/images/raw/' + imageUrl + '?source=ftchinese&height=' + imageHeight + '&fit=' + fitType;
        thisFigure.innerHTML = '<img src="' + imageUrl + '">';
        thisFigure.className = '';
      } else if (imageWidth > 0 && imageHeight > 0) {
        imageUrl = imageUrl.replace('i.ftimg.net', 'i.ftmailbox.com');
        imageUrl = encodeURIComponent(imageUrl);
        imageUrl = 'https://image.webservices.ft.com/v1/images/raw/' + imageUrl + '?source=ftchinese&width=' + imageWidth + '&height=' + imageHeight + '&fit=' + fitType;
        thisFigure.innerHTML = '<img src="' + imageUrl + '">';
        thisFigure.className = '';
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
      if (videoWidth > 0 && videoHeight > 0) {
        //console.log (videoId + ' Height: ' + videoHeight + ' Width: ' + videoWidth);
        thisVideo.innerHTML = '<iframe name="video-frame" id="video-frame" style="width:100%;height:100%;position:absolute;" src="' + hostForVideo + '/video/'+ videoId +'?i=2&k=1&w='+videoWidth+'&h='+videoHeight+'&autostart=false" scrolling="no" frameborder="0" allowfullscreen=true></iframe>';
        thisVideo.className = '';
      }
    }
  }

  function isTouchDevice() {
      var el = document.createElement('div');
      el.setAttribute('ongesturestart', 'return;');
      if (typeof el.ongesturestart === 'function') {
          return true;
      } else {
          return false;
      }
  }


  try {
    delegate = new Delegate(document.body);
  } catch (ignore) {

  }

  // get the top of navigation
  gNavOffsetY = findTop(document.querySelector('.o-nav__placeholder'));

  // disable sticky scroll on touch devices
  if (gNavOffsetY > 30 && w > 490 && isTouchDevice() === false) {
    try {
      stickyBottomPrepare();
      stickyAdsPrepare();
      var addEvent =  window.attachEvent||window.addEventListener;
      var eventScroll = window.attachEvent ? 'onscroll' : 'scroll';
      var eventResize = window.attachEvent ? 'onresize' : 'resize';
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
      });
      setInterval(function(){
          stickyBottomPrepare();
          stickyAdsPrepare();
      }, 10000);
    } catch (ignore) {

    }
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
      this.style.display = 'none';
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
  } catch (ignore) {

  }


//click to close
delegate.on('click', '.overlay-close, .overlay-bg', function(){
    var parentId = this.getAttribute('data-parentid');
    closeOverlay(parentId);
});