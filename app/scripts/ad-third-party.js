/* exported adReachability,showTextImageForAd */
var gCanReplaceInstoryWithAd = false;//表征文章内推荐块内容是否准备好，如果准备好，则可以将其用Ad替换
var gReplacedInstroyWithAd = false;//表征文章内推荐块内容已经用Ad替换
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
    
    console.log('decoded');
    var adTag = decodeURIComponent(sourceInfo.adTag)||'Hennessy';
    var adHeadline = decodeURIComponent(sourceInfo.adHeadline)||'轩尼诗百乐廷皇禧';
    var adLink = decodeURIComponent(sourceInfo.adLink)||'https://www.hennessy.com/zh-cn/hennessyparadisimperial/?utm_source=Ftchinese%20homepage%20top%20banner&utm_campaign=HPI2017JuntoJulCampaignDigital&utm_content=Ad&utm_term=JuntoJulCampaign&smtid=499499531z216rz160ngzacz0z';
    var adLead = decodeURIComponent(sourceInfo.adLead)||'轩尼诗百乐廷皇禧干邑蕴含令人叹为观止的甄选艺术，是历任调配总艺师不懈追求卓越的结晶。';
    var adImg = decodeURIComponent(sourceInfo.adImg)||'https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fi.ftimg.net%2Fpicture%2F7%2F000071147_piclink.jpg?source=ftchinese&width=1340&height=754&fit=cover';
    var clickAction = 'click' + sourceInfo.adType;

    if(tagDiv && headlineA && leadDiv && imageA && imageFigure && imageImg) {
      tagDiv.innerHTML = adTag;

      headlineA.innerHTML = adHeadline;
      headlineA.setAttribute('data-ec','Text and Image Ad');
      headlineA.setAttribute('data-ea',clickAction);
      headlineA.setAttribute('data-el',adHeadline);
      headlineA.href = adLink;

      leadDiv.innerHTML = adLead;

      imageA.setAttribute('data-ec','Text and Image Ad');
      imageA.setAttribute('data-ea',clickAction);
      imageA.setAttribute('data-el',adHeadline);
      imageA.href = adLink;

      imageFigure.setAttribute('data-url',adImg);

      imageImg.src = adImg;
      imageImg.setAttribute('data-backupimage',adImg);
    }
    
    gReplacedInstroyWithAd = true;
    
  }

}
