/* jshint devel:true */
  var containerTop = [];
  var mainHeight = [];
  var sideHeight = [];
  var bodyHeight;
  var gNavOffsetY;
  var defaultPadding = 30;
  var sectionsWithSide = document.querySelectorAll('.block-container.has-side');
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var delegate;

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

  function stickyBottomPrepare() {
    bodyHeight = getBodyHeight();
    if (sectionsWithSide.length > 0) {
      for (var i=0; i<sectionsWithSide.length; i++) {
        containerTop[i] = findTop(sectionsWithSide[i]);
        mainHeight[i] = sectionsWithSide[i].querySelector('.content-inner').offsetHeight;
        sideHeight[i] = sectionsWithSide[i].querySelector('.side-inner').offsetHeight + defaultPadding;
        //sectionsWithSide[i].querySelector('.side-inner').style.backgroundColor = 'grey';
      }
    }
  }


  function stickyBottom() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var htmlClass = document.documentElement.className;
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
        var sectionClassName = sectionsWithSide[i].className;
        var sectionClassNameNew = sectionClassName.replace(/fixmain|fixside|bottommain|bottomside/g,'');
        var minHeight = Math.min(mainHeight[i], sideHeight[i]);
        var maxHeight = Math.max(mainHeight[i], sideHeight[i]);
        var maxScroll = containerTop[i] + maxHeight - bodyHeight - scrollTop;
        var minScroll = containerTop[i] + minHeight - bodyHeight - scrollTop;
        //console.log (i + ': ' + maxScroll + '/' + minScroll);
        if (mainHeight[i]>sideHeight[i]) {
          if (maxScroll<=0) {
            sectionClassNameNew += ' bottomside';
          } else if (minScroll<=0 ) {
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
          //console.log (sectionClassNameNew);
        }
      }
    }
  }

  gNavOffsetY = findTop(document.getElementById('nav-place-holder'));

  try {
    delegate = new Delegate(document.body);
  } catch (ignore) {

  }

  // listent to scrolling events
  if (gNavOffsetY > 30 && w > 490) {
    try {
      stickyBottomPrepare();
      var addEvent =  window.attachEvent||window.addEventListener;
      var eventScroll = window.attachEvent ? 'onscroll' : 'scroll';
      var eventResize = window.attachEvent ? 'onresize' : 'resize';
      addEvent(eventScroll, function(){
          stickyBottom();
      });
      addEvent(eventResize, function(){
          stickyBottomPrepare();
      });
    } catch (ignore) {

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
    var imageHeight = thisFigure.offsetHeight;
    var imageUrl = thisFigure.getAttribute('data-url');
    if (imageWidth > 0 && imageHeight > 0) {
      imageUrl = imageUrl.replace('i.ftimg.net', 'i.ftmailbox.com');
      imageUrl = encodeURIComponent(imageUrl);
      imageUrl = 'https://image.webservices.ft.com/v1/images/raw/' + imageUrl + '?source=ftchinese&width=' + imageWidth + '&height=' + imageHeight + '&fit=cover';
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