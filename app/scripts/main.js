/* jshint devel:true */
(function(){
  'use strict';

  var gNavOffsetY = document.getElementById('nav-place-holder').offsetTop || 0;
  var stickyTopMargin = -60;
  var stickyBottomMargin = -360;
  var sectionsWithSide = document.querySelectorAll('.block-container.has-side');
  var placeHolder = [];
  var adContainer = [];
  var sectionBottom = [];
  var placeHolderTop = [];
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  


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
      for (var i=0; i<sectionsWithSide.length && i===0; i++) {
        placeHolder[i] = sectionsWithSide[i].querySelector('.ad-holder');
        adContainer[i] = sectionsWithSide[i].querySelector('.bottom-ad');
        sectionBottom[i] = findTop(sectionsWithSide[i].querySelector('.block-bottom'));
        if (placeHolder[i] !== null && adContainer[i] !== null && sectionBottom[i] !== null) {
          placeHolderTop[i] = findTop(placeHolder[i]);
        }
      }
    }
  }


  function stickyScroll() {

    var scrollTop = window.scrollY;
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
      for (var i=0; i<sectionsWithSide.length && i===0; i++) {
        if (placeHolder[i] !== null && adContainer[i] !== null && sectionBottom[i] !== null) {
          var adClassName = adContainer.className;
          var adClassNameNew = '';
          console.log ('place holder top');
          console.log (placeHolder[i].offsetTop);
          console.log (sectionsWithSide[i].querySelector('.vidoes').offsetTop);
          console.log (scrollTop - sectionBottom[i]);
          if (scrollTop - placeHolderTop[i] < stickyTopMargin) {
            adClassNameNew = 'bottom-ad';
          } else if (scrollTop - sectionBottom[i] > stickyBottomMargin) {
            adClassNameNew = 'bottom-ad sticky-bottom';
          } else {
            adClassNameNew = 'bottom-ad sticky-top';
          }
          if (adClassName !== adClassNameNew) {
            adContainer[i].className = adClassNameNew;
          }
        }
      }
    }



 

  }

  // listent to scrolling events
  if (gNavOffsetY > 30 && w > 490) {
    try {
      stickyScrollPrepare();
      window.addEventListener('scroll', stickyScroll);
    } catch (ignore) {

    }
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