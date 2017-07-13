/* exported adReachability,showTextImageForAd */
var gCanReplaceInstoryWithAd = false;//表征文章内推荐块内容是否准备好，如果准备好，则可以将其用Ad替换
var gReplacedInstroyWithAd = false;//表征文章内推荐块内容已经用Ad替换

var optionalTexts = [
  {
    adTag:'美酒',
    adHeadline:'轩尼诗百乐廷皇禧干邑是如何酿造的？',
    adLead:'调配总艺师的非凡技艺在于，他能准确判断最适宜“生命之水”的陈化状态，并将它们孕育至优雅的巅峰。所谓“巅峰”，指的正是“生命之水”达至最佳状态时那个至关重要而又稍纵即逝的微妙时刻。'
  },
  {
    adTag:'美酒',
    adHeadline:'轩尼诗百乐廷皇禧干邑的口感如何？',
    adLead:'轩尼诗百乐廷皇禧干邑的淡雅色泽，预示它是一款清新愉悦的佳酿。个中绽放的花香，让人联想起纯净、清爽的春日。'
  },
  {
    adTag:'美酒',
    adHeadline:'我应如何品赏轩尼诗百乐廷皇禧干邑？',
    adLead:'在室温下，将20至40毫升的酒液倒入郁金香形状的水晶高脚杯中纯饮。这是对于轩尼诗百乐廷皇禧干邑最纯粹的品赏方式。'
  },
  {
    adTag:'美酒佳酿',
    adHeadline:'调配艺师家族集大成之作',
    adLead:'登峰造极的甄选艺术，沁人心脾的蓬勃香气，永无止境的品质升华。轩尼诗百乐廷皇禧干邑——承载费尔沃家族集七代传承之力的匠心之作。'
  },
  {
    adTag:'琼浆醇醪',
    adHeadline:'“生命之水”的香醇密码',
    adLead:'探秘费尔沃家族七代调配大师心血结晶的背后故事。极致优雅的百乐廷皇禧干邑，不仅是一门科学，更是一门艺术。'
  }
];
var textIndex = getRandomInt(0, 5);
console.log('textIndex:'+textIndex);
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
  //MARK: sourceInfo is the object that has all the information from advertiser
    /* @param sourceInfo: TYPE Object, eg:
     {
       adTag:"",
       adHeadline:"",
       adLink:"",
       adLead:"",
       adImg:"",
       adType:""
     }
     */
  //MARK:  if some dom exist, change the content
  // MARK: add appropriate event tracking
  // category: Text and Image Ad
  // action: click banner/mpu
  // label: headline 
  if (gCanReplaceInstoryWithAd === true && gReplacedInstroyWithAd === false) {
    var instoryDiv = document.getElementById('in-story-recommend');
    var tagDiv, headlineA, leadDiv, imageA, imageFigure, imageImg;
    if(instoryDiv) {
      tagDiv = instoryDiv.querySelector('.recommend-header');
      headlineA = instoryDiv.querySelector('.recommend-content a');
      leadDiv = instoryDiv.querySelector('.recommend-content .lead');
      imageA = instoryDiv.querySelector('.recommend-image');
      imageFigure = instoryDiv.querySelector('.recommend-image figure');
      imageImg = instoryDiv.querySelector('.recommend-image figure img');
    }
    

   //正式模式
   
    var adLink = decodeURIComponent(sourceInfo.adLink)||'https://www.hennessy.com/zh-cn/hennessyparadisimperial/?utm_source=Ftchinese%20homepage%20top%20banner&utm_campaign=HPI2017JuntoJulCampaignDigital&utm_content=Ad&utm_term=JuntoJulCampaign&smtid=499499531z216rz160ngzacz0z';
    var adImg = decodeURIComponent(sourceInfo.adImg)||'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fi.ftimg.net%2Fpicture%2F7%2F000071147_piclink.jpg?source=ftchinese&width=1340&height=754&fit=cover';
    var adType = sourceInfo.adType;
    

    // 本地模式
    /*
    var adLink = 'https://www.hennessy.com/zh-cn/hennessyparadisimperial/?utm_source=Ftchinese%20homepage%20top%20banner&utm_campaign=HPI2017JuntoJulCampaignDigital&utm_content=Ad&utm_term=JuntoJulCampaign&smtid=499499531z216rz160ngzacz0z';
    var adImg = 'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fi.ftimg.net%2Fpicture%2F7%2F000071147_piclink.jpg?source=ftchinese&width=1340&height=754&fit=cover';
    var adType = 'Leadboard';
    */


    // 文案非AB测试模式
    /*
    var adTag = decodeURIComponent(sourceInfo.adTag)||'Hennessy';
    var adHeadline = decodeURIComponent(sourceInfo.adHeadline)||'轩尼诗百乐廷皇禧';
    var adLead = decodeURIComponent(sourceInfo.adLead)||'轩尼诗百乐廷皇禧干邑蕴含令人叹为观止的甄选艺术，是历任调配总艺师不懈追求卓越的结晶。';
    */

    // 文案AB测试模式
    var adTag = optionalTexts[textIndex].adTag;
    var adHeadline = optionalTexts[textIndex].adHeadline;
    var adLead = optionalTexts[textIndex].adLead;

    

    var clickAction = 'click' + adType;

    if(tagDiv && headlineA && leadDiv && imageA && imageFigure && imageImg) {
      tagDiv.innerHTML = adTag;

      headlineA.innerHTML = adHeadline;
      headlineA.setAttribute('data-ec','Text and Image Ad');
      headlineA.setAttribute('data-ea',clickAction);
      headlineA.setAttribute('data-el', textIndex + adHeadline);
      headlineA.href = adLink;

      leadDiv.innerHTML = adLead;

      imageA.setAttribute('data-ec','Text and Image Ad');
      imageA.setAttribute('data-ea',clickAction);
      imageA.setAttribute('data-el',textIndex + adHeadline);
      imageA.href = adLink;

      imageFigure.setAttribute('data-url',adImg);

      imageImg.src = adImg;
      imageImg.setAttribute('data-backupimage',adImg);
    }
    
    gReplacedInstroyWithAd = true;

    // MARK: open the resource in an iFrame
    var randomNumber = Math.random();
    // console.log (randomNumber);
    if (randomNumber < 0.02 && window.footerMoreShowed === undefined) {
      var w2 = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      var h2 = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var footerEle = document.querySelector('.footer-container');
      footerEle.innerHTML += '<div id="footer-more"></div>';
      var footerMore = document.getElementById('footer-more');
      footerMore.innerHTML = '<div class="hide"><iframe width="' + w2 + '" height="'+ h2 +'" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" style="" src="' + adLink + '"></iframe></div>';
      ga('send','event','Text and Image Ad', 'click footer', '喝生命之水轩尼诗百乐廷皇禧干邑是一种什么样的体验?');
      window.footerMoreShowed = true;
    }
  }

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}
