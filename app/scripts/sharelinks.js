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
		var uaOfPage=navigator.userAgent || navigator.vendor || "", shareWeChat;
		var sinten = document.title;
		var shcode="";
		var t1; 
		var t2;
		var t3;
		var t4;
		var t5;
		var t6;
		var t7;
		var topsharelinks = '';
		shcode=window.location.href;
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
			topsharelinks+="<div><a id=sina href=\"javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f=\'http:\/\/v.t.sina.com.cn\/share\/share.php?appkey=4221537403\',u=z||d.location,p=[\'&url=\',e(u),\'?ccode="+t1+"&title=\',e(t||d.title),\'&ralateUid=1698233740&source=\',e(r),\'&sourceUrl=\',e(l),\'&content=\',c||\'gb2312\',\'&pic=\',e(p||\'\')].join(\'\');function%20a(){if(!window.open([f,p].join(\'\'),\'mb\',[\'toolbar=0,status=0,resizable=1,width=600,height=430,left=\',(s.width-600)\/2,\',top=\',(s.height-430)\/2].join(\'\')))u.href=[f,p].join(\'\');};if(\/Firefox\/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,\'\',\'\',\'\',\'"+sinten+"\',\'\',\'utf-8\'));\" title=\"分享到新浪微博\"><IMG src=\"http:\/\/s.ftimg.net\/img\/weibo.gif\" border=0><\/a><\/div>";
			topsharelinks+="<div><a id=qqweixin href=\""+mft+"#ccode="+t2+"\" target=_blank title=\"分享到微信\"><IMG src=\"http:\/\/s.ftimg.net\/img\/wechatnew.png\" border=0><\/a><\/div>";
			topsharelinks+="<div><a id=qq href=\"http://v.t.qq.com/share/share.php?url="+encodeURIComponent(location.href)+"?ccode="+t3+"&title="+encodeURIComponent(sinten.substring(0,76))+"&source=1000014&site=http://www.ftchinese.com\" target=_blank title=\"转播到腾讯微博\"><IMG src=\"http:\/\/s.ftimg.net\/img\/qq.gif\" border=0><\/a><\/div>";
		}


		var sl="";


		sl += "<div class=\"first-child\"><a id=qqweixin href=\""+mft+"#ccode="+t4+"\" target=_blank title=\"分享到微信\"><IMG src=\"http:\/\/s.ftimg.net\/img\/wechatnew.png\" border=0>微信<\/a><\/div>";


		sl += "<div><a id=sina href=\"javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f=\'http:\/\/v.t.sina.com.cn\/share\/share.php?appkey=4221537403\',u=z||d.location,p=[\'&url=\',e(u),\'?ccode="+t5+"&title=\',e(t||d.title),\'&ralateUid=1698233740&source=\',e(r),\'&sourceUrl=\',e(l),\'&content=\',c||\'gb2312\',\'&pic=\',e(p||\'\')].join(\'\');function%20a(){if(!window.open([f,p].join(\'\'),\'mb\',[\'toolbar=0,status=0,resizable=1,width=600,height=430,left=\',(s.width-600)\/2,\',top=\',(s.height-430)\/2].join(\'\')))u.href=[f,p].join(\'\');};if(\/Firefox\/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,\'\',\'\',\'\',\'"+sinten+"\',\'\',\'utf-8\'));\" title=\"分享到新浪微博\"><IMG src=\"http:\/\/s.ftimg.net\/img\/weibo.gif\" border=0>新浪微博<\/a><\/div>";



		sl += "<div><a id=qq href=\"http://v.t.qq.com/share/share.php?url="+encodeURIComponent(location.href)+"?ccode="+t6+"&title="+encodeURIComponent(sinten.substring(0,76))+"&source=1000014&site=http://www.ftchinese.com\" target=_blank title=\"转播到腾讯微博\"><IMG src=\"http:\/\/s.ftimg.net\/img\/qq.gif\" border=0>腾讯微博<\/a><\/div>";


		sl += "<div><a id=qqIM href=\"http://connect.qq.com/widget/shareqq/index.html?url="+encodeURIComponent(location.href)+"?ccode="+t7+"&desc="+encodeURIComponent("在FT中文网上看到的一篇文章，给你分享一下")+"&title="+encodeURIComponent(document.title)+"&summary="+encodeURIComponent(sinten.substring(0,76))+"&pics="+encodeURIComponent(shareIMGQQ)+"&flash=&site="+encodeURIComponent("FT中文网")+"&style=201&width=16&height=16&showcount=\" target=_blank title=\"分享到QQ\"><IMG src=\"http:\/\/s.ftimg.net\/img\/qq_share_icon.png\" border=0>QQ<\/a><\/div>";


		sl += "<div><a id=douban href=\"http://www.douban.com/recommend/?url="+encodeURIComponent(location.href)+"&title="+encodeURIComponent(document.title.substring(0,76))+"\" target=\"blank\" title=\"分享到豆瓣\"><img src=\"http://s.ftimg.net\/img\/douban.png\" width=\"15\"/>豆瓣网</a><\/div>";

		sl += "<div><a id=LinkedIn href=\"https://www.linkedin.com/cws/share?url="+encodeURIComponent(location.href)+"?ccode="+t8+"&original_referer=https%3A%2F%2Fdeveloper.linkedin.com%2Fsites%2Fall%2Fthemes%2Fdlc%2Fsandbox.php%3F&token=&isFramed=true&lang=zh_CN&_ts=1422502780259.2795\" target=\"blank\" title=\"分享到LinkedIn\"><img src=\"http:\/\/i.ftimg.net\/picture\/3\/000051693_piclink.jpg\" width=\"16\"/>领英</a><\/div>";



		sl += "<div><a id=sohu title=\"分享到搜狐微博\" href=\"javascript:void((function(s,d,e,r,l,p,t,z,c){var f=\'http:\/\/t.sohu.com\/third\/post.jsp?\',u=z||d.location,p=[\'&url=\',e(u),\'&title=\',e(t||d.title),\'&content=\',c||\'gb2312\',\'&pic=\',e(p||\'\')].join(\'\');function%20a(){if(!window.open([f,p].join(\'\'),\'mb\',[\'toolbar=0,status=0,resizable=1,width=660,height=470,left=\',(s.width-660)\/2,\',top=\',(s.height-470)\/2].join(\'\')))u.href=[f,p].join(\'\');};if(\/Firefox\/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,\'\',\'\',\'\',\'" + sinten + "\',\'\',\'utf-8\'));\"><IMG src=\"http:\/\/s.ftimg.net\/img\/sohu.png\" border=0>搜狐微博<\/a><\/div>";

		sl += "<div><a id=xianguo href=\"http://www.xianguo.com/service/submitdigg/?link="+encodeURIComponent(location.href)+"&title="+encodeURIComponent(document.title.substring(0,76))+"\" target=_blank title=\"分享到鲜果\"><IMG src=\"http:\/\/s.ftimg.net\/img\/xianguo.gif\" border=0>鲜果网<\/a><\/div>";

		sl += "<div><a id=qq href=\"http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+encodeURIComponent(location.href)+"\" target=_blank title=\"分享到QQ空间\"><IMG src=\"http:\/\/s.ftimg.net\/img\/qzone.gif\" border=0>QQ空间<\/a><\/div>";


		sl += "<div><a id=renren href=\"http://share.renren.com/share/buttonshare.do?link="+encodeURIComponent(location.href)+"&title="+encodeURIComponent(document.title.substring(0,76))+"\" target=_blank title=\"分享到人人网\"><IMG src=\"http:\/\/s.ftimg.net\/img\/renren.gif\" border=0>人人网<\/a><\/div>";

		sl += "<div><a id=twitter href=\"http://twitter.com/home?status="+encodeURIComponent((document.title+"："+checkMeta("description")).substring(0,80)+"... "+location.href)+"\" title=\"分享到Twitter\" target=\"new\"><img src=\"http://s.ftimg.net/img/twitter.png\">Twitter<\/a><\/div>";
		sl += "<div><a id=google href=\"http:\/\/www.google.com\/bookmarks\/mark?op=edit&output=popup&bkmk="+encodeURIComponent(location.href)+"&amp;title="+encodeURIComponent(document.title.substring(0,76))+"\" title=\"分享到Google\" target=_blank><img src=\"http://s.ftimg.net/img/google.gif\">Google<\/a><\/div>";
		sl += "<div><a id=yahoo href=\"http://buzz.yahoo.com/buzz?publisherurn=financial_tim933&amp;guid="+encodeURIComponent(location.href)+"\" title=\"分享到Yahoo! Buzz\" target=\"new\"><img src=\"http://s.ftimg.net/img/yahoobuzz.gif\">Yahoo! Buzz<\/a><\/div>";
		sl += "<div><a id=facebook href=\"http://www.facebook.com/sharer.php?u="+encodeURIComponent(location.href)+"&amp;t="+encodeURIComponent(document.title.substring(0,76))+"\" title=\"分享到Facebook\" target=\"new\"><img src=\"http://s.ftimg.net/img/facebook.gif\">Facebook<\/a><\/div>";
		sl += "<div><a id=delicious href=\"http://del.icio.us/post?v=4&amp;noui&amp;jump=close&amp;url="+encodeURIComponent(location.href)+"&amp;title="+encodeURIComponent(document.title.substring(0,76))+"\" title=\"分享到Delicious\" target=\"new\"><img src=\"http://s.ftimg.net/img/delicious.gif\">Delicious<\/a><\/div>";

		//sl += "<div class=clearfloat style='width:1024px;height:1px;float:none;'></div>";
		document.getElementById('sharelinks').innerHTML = sl;
	}
	sharelinks();

})();
/* jshint ignore:end */