/* jshint ignore:start */
(function(){
	function checkMeta(metaname) {
	    var metas = document.getElementsByTagName('META'),
	        i,
	        content="";
	    for (i = 0; i < metas.length; i++) {
	        if (metas[i].getAttribute('NAME') === metaname){
	            content = metas[i].getAttribute('CONTENT');
	        }
	    }
	    return content;
	}
	function sharelinks() {
		var sinten = document.title;
		var shcode = window.location.href;
		var t1; 
		var t2;
		var t3;
		var t4;
		var t5;
		var t6;
		var t7;
		var t8;
		var topsharelinks = '';
		// MARK: Add the gift id to shared url if available
		if (window.giftId && window.giftId !== '') {
			var connector = (shcode.indexOf('?')>=0) ? '&' : '?';
			shcode += connector + 'gift_id=' + window.giftId;
		}
		if(shcode.indexOf('shcode')!=-1){
			shcode=shcode.substring(shcode.indexOf('shcode'));
			shcode=shcode.replace(/[^\d]/g,'');
		}else{
			if(typeof(scodeSet)=="string"&&scodeSet.length==6){
				shcode=scodeSet;
			}
		}
		if(typeof(shcode)=="string"&&shcode.length==6){
			t1="1C"+shcode;
			t2="2C"+shcode;
			t3="3C"+shcode;
			t4="4C"+shcode;
			t5="5C"+shcode;
			t6="6C"+shcode;
			t7="7C"+shcode;
			t8='8C'+shcode;
		} else {
			t4="2G178001";
			t5="2G179001";
			t6="2G179002";
			t7="2G179001";
			t8='2G179003';
		}
		if (document.getElementById("weibomessege")){
		sinten=document.getElementById("weibomessege").innerHTML;
		}
		var shareIMGQQ="";
		if (typeof(shareIMG)=="string" && shareIMG!="") {
		    shareIMGQQ=shareIMG;
		}
		var tft=document.title;
		tft=encodeURIComponent(tft);
		var mft=location.href;
		if (document.getElementById("weixinr")) {
		    mft=document.getElementById("weixinr").getAttribute("href");
		} else {
		    mft="/m/corp/qrshare.html?url="+mft+"&title="+tft;
		}
		if(typeof(t1)=="string"){
			topsharelinks+="<div><a id=sina href=\"javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f=\'http:\/\/v.t.sina.com.cn\/share\/share.php?appkey=4221537403\',u=z||d.location,p=[\'&url=\',e(u),\'?ccode="+t1+"&title=\',e(t||d.title),\'&ralateUid=1698233740&source=\',e(r),\'&sourceUrl=\',e(l),\'&content=\',c||\'gb2312\',\'&pic=\',e(p||\'\')].join(\'\');function%20a(){if(!window.open([f,p].join(\'\'),\'mb\',[\'toolbar=0,status=0,resizable=1,width=600,height=430,left=\',(s.width-600)\/2,\',top=\',(s.height-430)\/2].join(\'\')))u.href=[f,p].join(\'\');};if(\/Firefox\/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,\'\',\'\',\'\',\'"+sinten+"\',\'\',\'utf-8\'));\" title=\"分享到新浪微博\"><IMG src=\"https:\/\/d2785ji6wtdqx8.cloudfront.net\/img\/weibo.gif\" border=0><\/a><\/div>";
			topsharelinks+="<div><a id=qqweixin href=\""+mft+"#ccode="+t2+"\" target=_blank title=\"分享到微信\"><IMG src=\"https:\/\/d2785ji6wtdqx8.cloudfront.net\/img\/wechatnew.png\" border=0><\/a><\/div>";
			topsharelinks+="<div><a id=qq href=\"http://v.t.qq.com/share/share.php?url="+encodeURIComponent(location.href)+"?ccode="+t3+"&title="+encodeURIComponent(sinten.substring(0,76))+"&source=1000014&site=https://www.ftchinese.com\" target=_blank title=\"转播到腾讯微博\"><IMG src=\"https:\/\/d2785ji6wtdqx8.cloudfront.net\/img\/qq.gif\" border=0><\/a><\/div>";
		}
	}
	sharelinks();
})();
/* jshint ignore:end */