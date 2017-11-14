/* exported adReachability,showTextImageForAd, gCanReplaceInstoryWithAd, gReplacedInstroyWithAd, getRandomInt */
var gCanReplaceInstoryWithAd = false;//表征文章内推荐块内容是否准备好，如果准备好，则可以将其用Ad替换
var gReplacedInstroyWithAd = false;//表征文章内推荐块内容已经用Ad替换

// var optionalTexts = [
//   {
//     adTag:'美酒',
//     adHeadline:'轩尼诗百乐廷皇禧干邑是如何酿造的？',
//     adLead:'调配总艺师的非凡技艺在于，他能准确判断最适宜“生命之水”的陈化状态，并将它们孕育至优雅的巅峰。所谓“巅峰”，指的正是“生命之水”达至最佳状态时那个至关重要而又稍纵即逝的微妙时刻。'
//   },
//   {
//     adTag:'美酒',
//     adHeadline:'轩尼诗百乐廷皇禧干邑的口感如何？',
//     adLead:'轩尼诗百乐廷皇禧干邑的淡雅色泽，预示它是一款清新愉悦的佳酿。个中绽放的花香，让人联想起纯净、清爽的春日。'
//   },
//   {
//     adTag:'美酒',
//     adHeadline:'我应如何品赏轩尼诗百乐廷皇禧干邑？',
//     adLead:'在室温下，将20至40毫升的酒液倒入郁金香形状的水晶高脚杯中纯饮。这是对于轩尼诗百乐廷皇禧干邑最纯粹的品赏方式。'
//   },
//   {
//     adTag:'美酒佳酿',
//     adHeadline:'调配艺师家族集大成之作',
//     adLead:'登峰造极的甄选艺术，沁人心脾的蓬勃香气，永无止境的品质升华。轩尼诗百乐廷皇禧干邑——承载费尔沃家族集七代传承之力的匠心之作。'
//   },
//   {
//     adTag:'琼浆醇醪',
//     adHeadline:'“生命之水”的香醇密码',
//     adLead:'探秘费尔沃家族七代调配大师心血结晶的背后故事。极致优雅的百乐廷皇禧干邑，不仅是一门科学，更是一门艺术。'
//   }
// ];
// var textIndex = getRandomInt(0, 5);
// console.log('textIndex:'+textIndex);
function adReachability() {
  var thirdPartyVendors = {
    'dcR': '_dc',
    'mmR': '_mm',
    'szR': '_sz',
    'amR': '_am'
  };
  var adParameter = '';
  var adReachabilityStatus;
  for (var k in thirdPartyVendors) {
      if (thirdPartyVendors.hasOwnProperty(k)) {
         //user[k] = data[k];
         //console.log (k + ': ' + thirdPartyVendors[k]);
         try {
             if (typeof window.GetCookie === 'function') {
                adReachabilityStatus = GetCookie(k);
             } else {
                adReachabilityStatus = getCookie(k);
             }
         } catch(ignore) {
            adReachabilityStatus = null;
         }
         
         if (adReachabilityStatus === 'reachable') {
          adParameter += '&' + thirdPartyVendors[k] + '=1';
         } else if (window.gIsSpider === true && (k === 'dcR' || k === 'amR')) {
          // MARK: - If it's spam. Don't use DoubleClick and AdMaster to serve
          adParameter += '&' + thirdPartyVendors[k] + '=0';
         } else if (adReachabilityStatus === null) {
          adParameter += '&' + thirdPartyVendors[k] + '=2';
         }
      }
  }
  if (typeof window.gUserType !== 'string') {
    window.gUserType = 'visitor';
  }
  adParameter += '&' + '_ut=' + window.gUserType;
  //console.log (adParameter);
  return adParameter;
}


function showTextImageForAd(sourceInfo) {
  
  if (gCanReplaceInstoryWithAd === true && gReplacedInstroyWithAd === false) {
   //正式模式
    //console.log ('show text image for ad!');   
    var adLink = decodeURIComponent(sourceInfo.adLink)||'https://www.hennessy.com/zh-cn/hennessyparadisimperial/campaign.htm?utm_source=Ftchinese%20homepage%20top%20banner&utm_campaign=HPI2017OcttoNovCampaignDigital&utm_content=Ad&utm_term=OcttoNovCampaign&smtid=509415688z2906z1cm6gzacz0z';
    var adTitle = sourceInfo.adTitle || '轩尼诗顶通20171031';
    // MARK: open the resource in an iFrame
    var randomNumber = Math.random();
    //console.log ('random number is ' + randomNumber);
    if (randomNumber < 0.009 && window.footerMoreShowed === undefined) {
      var w2 = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      var h2 = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var footerEle = document.querySelector('.footer-container');
      footerEle.innerHTML += '<div id="footer-more"></div>';
      var footerMore = document.getElementById('footer-more');
      footerMore.innerHTML = '<div><iframe id="footer-more-frame" width="' + w2 + '" height="'+ h2 +'" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" style="" src="' + adLink + '"></iframe></div>';
      ga('send','event','Text and Image Ad', 'click footer', adTitle);
      window.footerMoreShowed = true;
      gReplacedInstroyWithAd = true;
      // var randomNumber1 = Math.random();
      // if (randomNumber1 < 0.7) {
      //   setTimeout(function(){
      //     document.getElementById('footer-more-frame').style.width = '1200px';
      //     document.getElementById('footer-more-frame').style.height = '3500px';
      //   }, 2000);
      // }
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}
