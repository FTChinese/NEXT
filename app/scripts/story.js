var fontOptionsEle;
var fs;
var xhr = new XMLHttpRequest();
var ajaxMethod;
var ajaxUrl;
var message = {};
var recommendLoaded = false;
var recommendInner = document.getElementById('story-recommend');

message.head = {};
message.head.transactiontype = '61008';
message.head.source = 'web';
message.body = {};
message.body.ielement = {};
message.body.ielement.storyid = '';

if (/127\.0|localhost|192\.168/.test(window.location.href)) {
	ajaxMethod = 'GET';
	ajaxUrl = '/api/page/recommend.json';
} else {
	ajaxMethod = 'POST';
	ajaxUrl = '/eaclient/apijson.php';
}

ga('send','event','Recommend Story API', 'Load', '', {'nonInteraction':1});
xhr.open(ajaxMethod, encodeURI(ajaxUrl));
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
    if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        var maxItem = 8;
        var itemCount = 0;
        var itemHTML = '';
        if (data.body.oelement.errorcode === '0') {
        	if (data.body.odatalist && data.body.odatalist.length > 0) {
        		for (var i=0; i<data.body.odatalist.length; i++) {
        			var itemClass = 'XL3 L3 M6 S6 P12';
        			var itemHeadline = data.body.odatalist[i].cheadline;
        			var itemImage = data.body.odatalist[i].piclink;
        			var itemId = data.body.odatalist[i].storyid;
                    var itemT = data.body.odatalist[i].t;
                    if(itemT === undefined || itemT === null) {itemT = '';}
        			var itemTop = '';
        			var itemTopClass = 'PT';
        			if (itemCount % 4 === 0) {
        				itemTopClass += ' XLT LT';
        			}
        			if (itemCount % 2 === 0) {
        				itemTopClass += ' MT ST';
        			}
        			if (itemTopClass !== '' && itemCount >0) {
        				itemTop = '<div class="' + itemTopClass + '"></div>';
        			}

        			if (itemCount<maxItem && itemImage && itemImage !== '') {
	        			itemHTML += itemTop + '<div class="item-container ' + itemClass + ' has-image no-lead"><div class="item-inner"><h2 class="item-headline"><a data-ec="Story Recommend" data-ea="Click" data-el="'+itemT+'/story/'+itemId+'" target="_blank" href="/story/'+itemId+'?tcode=smartrecommend">'+itemHeadline+'</a></h2><a data-ec="Story Recommend" data-ea="Click" data-el="'+itemT+'/story/'+itemId+'" class="image" target="_blank" href="/story/'+itemId+'?tcode=smartrecommend"><figure class="loading" data-url="'+itemImage+'"></figure></a><div class="item-bottom"></div></div></div>';
	        			itemCount += 1;
        			}
        		}
                recommendInner.innerHTML = itemHTML;
                document.getElementById('story-recommend-container').style.display = 'block';
                loadImages();
                recommendLoaded = true;
                ga('send','event','Recommend Story API', 'Success', '', {'nonInteraction':1});
        	} else {
                ga('send','event','Recommend Story API', 'No Data', '', {'nonInteraction':1});
            }
        } else {
            ga('send','event','Recommend Story API', 'Parse Fail', data.body.oelement.errorcode, {'nonInteraction':1});
        }
    } else if (xhr.status !== 200) {
        ga('send','event','Recommend Story API', 'Request Fail', '', {'nonInteraction':1});
        //alert('Request failed.  Returned status of ' + xhr.status);
    }
    
};
xhr.send(JSON.stringify(message));

//set font
fontOptionsEle = document.getElementById('font-options');

//fontOptionsDivs = fontOptionsEle.querySelectorAll('div');

//click to change font size and set cookie (fs)
//Dom Delegate doesn't work here on iOS
fontOptionsEle.onclick = function (e) {
    var currentClass = e.target.className || '';
    var selectedClass;
    var storyContainerClass = document.querySelector('.story-container').className;
    if (currentClass.indexOf('selected') <0) {
        if (fontOptionsEle.querySelector('.selected')) {
            selectedClass = fontOptionsEle.querySelector('.selected').className || '';
        } else {
            selectedClass = '';
        }
        selectedClass = selectedClass.replace(/ selected/g, '');
        if (fontOptionsEle.querySelector('.selected')) {
            fontOptionsEle.querySelector('.selected').className = selectedClass;
        }
        e.target.className = currentClass + ' selected';
        /* jshint ignore:start */
        SetCookie('fs',currentClass,'','/');
        /* jshint ignore:end */
        storyContainerClass = storyContainerClass.replace(/ (normal|bigger|biggest|smaller|smallest)/g,'');
        document.querySelector('.story-container').className = storyContainerClass + ' ' + currentClass;
        stickyBottomPrepare();
        stickyAdsPrepare();
        setResizeClass();
    }
};




//click to change font size and set cookie (fs)
// delegate.on('click', '.font-options div', function(){
//     var currentClass = this.className || '';
//     var selectedClass;
//     var storyContainerClass = document.querySelector('.story-container').className;
//     if (currentClass.indexOf('selected') <0) {
//         selectedClass = fontOptionsEle.querySelector('.selected').className;
//         selectedClass = selectedClass.replace(/ selected/g, '');
//         fontOptionsEle.querySelector('.selected').className = selectedClass;
//         this.className = currentClass + ' selected';
//         /* jshint ignore:start */
//         SetCookie('fs',currentClass,'','/');
//         /* jshint ignore:end */
//         storyContainerClass = storyContainerClass.replace(/ (normal|bigger|biggest|smaller|smallest)/g,'');
//         document.querySelector('.story-container').className = storyContainerClass + ' ' + currentClass;
//         stickyBottomPrepare();
//         stickyAdsPrepare();
//         setResizeClass();
//     }
// });

//set font by getting user cookie (fs)
/* jshint ignore:start */
fs = GetCookie('fs');
/* jshint ignore:end */
if (typeof fs === 'string' && fs !== null && fs !== '' && document.getElementById('font-options') && document.querySelector('.story-container')) {
    document.getElementById('font-options').querySelector('.' + fs.replace(/ /g, '.')).className = fs + ' selected';
    document.querySelector('.story-container').className = document.querySelector('.story-container').className + ' ' + fs;
    setResizeClass();
} else {
    document.getElementById('font-setting').querySelector('.normal').className = 'normal selected';
}


/* jshint ignore:start */
// var bpage=0;
// function viewhistory() {
//     var username=GetCookie("USER_NAME"),
//         unixday=Math.round(new Date().getTime()/1000),
//         viewstart=GetCookie ("viewstart"),
//         clearhistory=0,
//         v,
//         k,
//         barrierversion,
//         ie6,
//         isIE;
//     if (typeof storyid==="string" && storyid!=="" && (username===''||username===null) && (location.href.match(/\/story\/[0-9]{9}$/g)!==null||location.href.indexOf("barrierversion")>0)) {
        
//         if (viewstart===null || viewstart==="") {
//             viewstart=unixday;
//             SetCookie("viewstart",unixday,86400*100,"/");
//         } else if (unixday-viewstart>=30*86400) {
//             DeleteCookie ("viewstart");
//             DeleteCookie ("viewhistory");
//             SetCookie("viewstart",unixday,86400*100,"/");
//             clearhistory=1;
//         }

//         v=GetCookie ("viewhistory");
//         if (v===null || clearhistory===1) {
//             v="";
//         }
//         v=v.replace(storyid,"").replace(/[\|]+/g,"|");
//         v=v+"|"+storyid;
//         v=v.replace(/^\|+/g,"").replace(/^[0-9]{1,8}\|/g,"");
//         if (v.length>=120) {
//             v=v.replace(/^[0-9]+\|/g,"");
//         }
//         DeleteCookie ("viewhistory");
//         SetCookie("viewhistory",v,86400*100,"/");
//         if (v.length>=50  && (document.referrer.indexOf("ftchinese.com")>=0 ||location.href.indexOf("barrierversion")>0)) {
//             bpage=1;
//             if (location.href.indexOf("ftchinese.com")>=0) {
                
//                 //if(i<0.3){bpage=2}else if(i<0.5){bpage=3}
//                 if (v.length>=100) {bpage=3;}
//                 k=GetCookie("bp");
//                 if (k!==null&&k!==""&&k>=2){bpage=k;}
//                 barrierversion=paravalue(window.location.href,"barrierversion");
//                 if (barrierversion!==null && barrierversion!==""){bpage=parseInt(barrierversion,0);}
//                 //如果是IE6，则不弹出全屏模式，但是一定让他登录才能看文章
//                 ie6=!!window.ActiveXObject&&!window.XMLHttpRequest;
//                 isIE=!!window.ActiveXObject;
//                 if (ie6 && v.length>=100) {
//                     bpage=6;
//                     $.get("/m/marketing/reg.html", function(data){
//                         $("#bodytext p").slice(2).remove();
//                         $("#bodytext p").eq(1).after(data.replace(/5篇以上文章/g,"10篇以上文章")+"<div style='font-weight:bold;color:#FFF;padding:5px;background:#9E2F50;margin-bottom:15px;'>友好提示：我们注意到您还在使用IE6浏览，这会带来安全隐患。建议您升级到更高的版本，或使用最新的FireFox或Chrome等浏览器。</div>");
//                     });         
//                 } else if (isIE && v.length>=100) {
//                     $.get("/m/marketing/reg.html", function(data){
//                         $("#bodytext p").slice(2).remove();
//                         $("#bodytext p").eq(1).after(data.replace(/5篇以上文章/g,"10篇以上文章"));
//                     });         
//                 } else if (bpage>=2 && v.length>=100 && $(window).width()>1024 && (window.Modernizr === undefined || !window.Modernizr.touch)) {
//                     $.get("/m/marketing/reg"+bpage+".html", function(data){
//                     if (data.indexOf("用户名或电子邮件")>0) {
//                         $("#bodytext").html(data);
//                         $("#rail-content").empty();
//                         $(".story_list,#top590x60,#commentheader,#logincomment,#nologincomment,.commentcontainer,#sharelinks,.announce").remove();
//                         SetCookie("bp",bpage,86400*100,"/");
//                         }
//                     });
//                 } else {
//                     $.get("/m/marketing/reg.html", function(data){
//                         $("#bodytext p").eq(1).after(data);
//                     });
//                 }
//             }
//         }
//     }
// }
/* jshint ignore:end */