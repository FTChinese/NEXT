/* jshint devel:true */
(function(){
  'use strict';
  function findTop(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
      do {
        curtop += obj.offsetTop;
      } while ((obj = obj.offsetParent));
      return curtop;
    }
  }

  function stickyScrollPrepare() {
    if (sectionsWithSide.length > 0) {
      for (var i=0; i<sectionsWithSide.length; i++) {
        placeHolder[i] = sectionsWithSide[i].querySelector('.ad-holder');
        adContainer[i] = sectionsWithSide[i].querySelector('.bottom-ad');
        //console.log (adContainer[i]);
        sectionBottom[i] = findTop(sectionsWithSide[i].querySelector('.block-bottom'));
        if (placeHolder[i] !== null && adContainer[i] !== null && sectionBottom[i] !== null) {
          placeHolderTop[i] = findTop(placeHolder[i]);
        }
      }
    }
  }



  function stickyScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var htmlClass = document.documentElement.className;

    //alert (scrollTop);
    if (scrollTop >=gNavOffsetY) {
      if (htmlClass.indexOf(' is-sticky')<0) {
        document.documentElement.className = htmlClass + ' is-sticky';
      }
    } else {
      if (htmlClass.indexOf(' is-sticky')>=0) {
        document.documentElement.className = htmlClass.replace(/ is-sticky/g, '');
      }
    }
    if (sectionsWithSide.length > 0) {
      for (var i=0; i<sectionsWithSide.length; i++) {
        //console.log (i);
        if (placeHolder[i] !== null && adContainer[i] !== undefined && sectionBottom[i] !== null) {
          
          //console.log (adContainer[i]);
          var adClassName = adContainer[i].className;
          var adClassNameNew = '';
          // console.log ('place holder top');
          // console.log (placeHolder[i].offsetTop);
          // console.log (sectionsWithSide[i].querySelector('.vidoes').offsetTop);
          // console.log (scrollTop - sectionBottom[i]);
          //console.log (scrollTop - placeHolderTop[i]);
          if (scrollTop - placeHolderTop[i] < stickyTopMargin) {
            adClassNameNew = 'bottom-ad';
          } else if (scrollTop - sectionBottom[i] > stickyBottomMargin) {
            adClassNameNew = 'bottom-ad sticky-bottom';
          } else {
            adClassNameNew = 'bottom-ad sticky-top';
          }
          if (adClassName !== adClassNameNew) {
            try {
            adContainer[i].className = adClassNameNew;
            } catch (err) {
              console.log (i);
            }
          }
        }
      }
    }
  }


  function getBodyHeight() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return y;
  }


var containerTop = [];
var mainHeight = [];
var sideHeight = [];
var bodyHeight;

  function stickyBottomPrepare() {
    bodyHeight = getBodyHeight();
    if (sectionsWithSide.length > 0) {
      for (var i=0; i<sectionsWithSide.length; i++) {
        // set the width of main and side content for sticky effect. 

        /*
        var sectionWidth = sectionsWithSide[i].querySelector('.block-inner').offsetWidth;
        var sectionSideWidth = sectionsWithSide[i].querySelector('.side-container').offsetWidth;
        var sectionMainDom =  sectionsWithSide[i].querySelector('.content-container');
        var sectionMainWidth = sectionWidth - sectionSideWidth - (defaultPadding * 1.5);

        sectionMainDom.style.width = sectionMainWidth + 'px';
        sectionMainDom.querySelector('.content-inner').style.borderWidth = 0;
        sectionMainDom.querySelector('.content-inner').style.width = sectionMainWidth + 'px';
        sectionsWithSide[i].querySelector('.side-inner').style.backgroundColor = bannerBG;
        sectionsWithSide[i].querySelector('.side-container').style.backgroundColor = bannerBG;


        var contentInnerWidth = sectionsWithSide[i].querySelector('.content-inner').offsetWidth;
        console.log (sectionWidth);
        console.log (sectionSideWidth);

        */
        //sectionsWithSide[i].querySelector('.content-inner').style.width = contentInnerWidth + 'px';
        containerTop[i] = findTop(sectionsWithSide[i]);
        mainHeight[i] = sectionsWithSide[i].querySelector('.content-inner').offsetHeight;
        //console.log (adContainer[i]);
        sideHeight[i] = sectionsWithSide[i].querySelector('.side-inner').offsetHeight + defaultPadding;
      }
    }
  }


  function stickyBottom() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var htmlClass = document.documentElement.className;

    //alert (scrollTop);
    if (scrollTop >=gNavOffsetY) {
      if (htmlClass.indexOf(' is-sticky')<0) {
        document.documentElement.className = htmlClass + ' is-sticky';
      }
    } else {
      if (htmlClass.indexOf(' is-sticky')>=0) {
        document.documentElement.className = htmlClass.replace(/ is-sticky/g, '');
      }
    }
    if (sectionsWithSide.length > 0) {
      for (var i=0; i<sectionsWithSide.length; i++) {
          
        //console.log (adContainer[i]);
        var sectionClassName = sectionsWithSide[i].className;
        var sectionClassNameNew = sectionClassName.replace(/fixmain|fixside|bottommain|bottomside/g,'');
        var minHeight = Math.min(mainHeight[i], sideHeight[i]);
        var maxHeight = Math.max(mainHeight[i], sideHeight[i]);

        var maxScroll = containerTop[i] + maxHeight - bodyHeight - scrollTop;
        var minScroll = containerTop[i] + minHeight - bodyHeight - scrollTop;

        //console.log ('container: '+ i + ', scrollTop: ' + scrollTop + ': minScroll: ' + minScroll + ': maxScroll: ' + maxScroll +', containerTop: ' + containerTop[i] + ', mainHeight: ' + mainHeight[i] + ', sideHeight: ' + sideHeight[i] + ', bodyHeight: ' + bodyHeight);
        // if (maxScroll<0) {
        //   if (mainHeight[i]>sideHeight[i]) {
        //     sectionClassNameNew += ' bottomside';
        //   } else if (mainHeight[i]<sideHeight[i]) {
        //     sectionClassNameNew += ' bottommain';
        //   }
        // } else if (minScroll<0) {
        //   if (mainHeight[i]>sideHeight[i]) {
        //     sectionClassNameNew += ' fixside';
        //   } else if (mainHeight[i]<sideHeight[i]) {
        //     sectionClassNameNew += ' fixmain';
        //   }
        // }


        if (mainHeight[i]>sideHeight[i]) {
          if (maxScroll<0) {
            sectionClassNameNew += ' bottomside';
          } else if (minScroll<0 ) {
            sectionClassNameNew += ' fixside';
          }
        } else if (mainHeight[i]<sideHeight[i]) {
          if (maxScroll<30) {
            sectionClassNameNew += ' bottommain';
          } else if (minScroll<0){
            sectionClassNameNew += ' fixmain';
          }
        }


        sectionClassNameNew = sectionClassNameNew.replace(/[\s]+/g,' ');
        if (sectionClassNameNew !== sectionClassName) {
          sectionsWithSide[i].className = sectionClassNameNew;
        }

/*
        if (scrollTop - placeHolderTop[i] < stickyTopMargin) {
          adClassNameNew = 'bottom-ad';
        } else if (scrollTop - sectionBottom[i] > stickyBottomMargin) {
          adClassNameNew = 'bottom-ad sticky-bottom';
        } else {
          adClassNameNew = 'bottom-ad sticky-top';
        }
        if (adClassName !== adClassNameNew) {
          try {
          adContainer[i].className = adClassNameNew;
          } catch (err) {
            console.log (i);
          }
        }
*/
      }
    }
  }

  //global variables
  var gNavOffsetY = findTop(document.getElementById('nav-place-holder'));
  var stickyTopMargin = -44;
  var stickyBottomMargin = -360;
  var defaultPadding = 30;
  var bannerBG = '#F6E9D8';
  var sectionsWithSide = document.querySelectorAll('.block-container.has-side');
  var placeHolder = [];
  var adContainer = [];
  var sectionBottom = [];
  var placeHolderTop = [];
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var delegate;

  try {
    delegate = new Delegate(document.body);
  } catch (ignore) {

  }

  // listent to scrolling events
  if (gNavOffsetY > 30 && w > 490) {
    try {
      //stickyScrollPrepare();

      stickyBottomPrepare();

      var addEvent =  window.attachEvent||window.addEventListener;
      var event = window.attachEvent ? 'onscroll' : 'scroll';
      addEvent(event, function(){
          //stickyScroll();
          stickyBottom();
      });

    } catch (ignore) {
      console.log (ignore);
    }
  }


  // check svg support
  // SVG is default, no-svg is exception
  if (typeof SVGRect === 'undefined') {
    document.documentElement.className += ' no-svg';
  }

  // load responsive images
  var figures = document.querySelectorAll('figure.loading');
  for (var i=0; i<figures.length; i++) {
    var thisFigure = figures[i];
    var imageWidth = thisFigure.offsetWidth;
    var imageUrl = thisFigure.getAttribute('data-url');
    if (imageWidth > 0) {
      imageUrl = imageUrl.replace('i.ftimg.net', 'i.ftmailbox.com');
      imageUrl = encodeURIComponent(imageUrl);
      imageUrl = 'https://image.webservices.ft.com/v1/images/raw/' + imageUrl + '?source=ftchinese&width=' + imageWidth + '&fit=scale-down';
      thisFigure.innerHTML = '<img src="' + imageUrl + '">';
      thisFigure.className = '';
    }

    //A cool trick to handle images that fail to load:
    try {
      delegate.on('error', 'img', function(){
        this.style.display = 'none';
      });
    } catch (ignore) {

    }
  }

  // click events
  try {
    delegate.on('click', 'a', function(){
      //alert (this.innerHTML);
    });
  } catch (ignore) {

  }


})(); 







/* jshint devel:true */
/****dolphin广告****/
//参数依次为
//位置ID
//频道ID
//DOM节点ID(script选填，script方式不需要NodeID，采用document.write)
//iframe宽高（选填，不传这两个参数将添加script广告）
/*
function dolphinAD(pID,cID,NodeID,w,h){
    var adCode;
    if(!pID){
        return "positionID missing";
    }
    if(!cID){
        return "channelID missing";
    }
    if(w&&h){//iframe方式
        if(!w){
            return "width missing";
        }
        if(!h){
            return "height missing";
        }
        //adCode = '<iframe width="'+w+'" height="'+h+'" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" src="http://dolphin.ftimg.net/s?z=ft&c='+cID+pID+slotStr+'&op=1" ></iframe>';
        adCode = '<iframe width="'+w+'" height="'+h+'" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" src="/m/marketing/ad.html#adid=' + cID + pID + slotStr + '" ></iframe>';
        if (document.getElementById(NodeID)){
            document.getElementById(NodeID).innerHTML=adCode;
            return adCode;
        }
        return "node missing";
    }
    //script 方式
    try {
        adCode = '<scr'+'ipt type="text/javascript" src="http://dolphin.ftimg.net/s?z=ft&c='+cID+pID+slotStr+adReachability()+'" charset="gbk" ></scr'+'ipt>';
        document.write(adCode);
    } catch (err) {
        var k=err.toString();
        ga('send','event', 'CatchError', 'AD', pId + '' + cID + ':' + k, {'nonInteraction':1});
    }
    return adCode;
}

function setDolphinSlot(key){
  //定义slot随机数实现联动互斥功能
  var rString = window.dolRand?"&slot="+window.dolRand:"",
      cString = GetCookie(key),
      x;
  if(!cString){return rString;}
  window.cArray = cString.split(";");
  for(x in window.cArray){
      if (window.cArray.hasOwnProperty(x)) {
          window.cArray[x]=window.cArray[x].replace("|","=");
          rString += "&_"+window.cArray[x];
      }
  }
  return rString;
}
*/