<!DOCTYPE html>
<html class="no-js core is-ie-8" data-next-app="front-page">
 <head>
 <meta charset="utf-8" />
 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
 <title>FT中文网</title>
 <meta http-equiv="Content-Language" content="zh-CN"/>
 <meta content="<%$p.meta.description%>" name="description"/>
 <meta name="apple-mobile-web-app-status-bar-style" content="black" />
 <link rel="apple-touch-icon-precomposed" href="http://static.ftchinese.com/img/ipad_icon.png" />
 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 <link rel="preconnect" href="http://static.ftchinese.com" />
 <link rel="preconnect" href="http://i.ftimg.net" />
 <script>
 window.errorBuffer = window.errorBuffer || [];
 function beaconCssError(e) {
 window.errorBuffer.push({
 error: e ? e : new Error('CSS failed to load.'),
 context: {
 isMobileNetork: document.cookie.replace(/(?:(?:^|.*;\s*)h2_isMobile\s*\=\s*([^;]*).*$)|^.*$/, "$1") === '' ? false : true
 }
 });
 }
 </script>

<script>
window.cutsTheMustard = (typeof Function.prototype.bind !== 'undefined');
if (window.cutsTheMustard) {
document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/, 'js').replace(/\bcore\b/, 'enhanced');
}
</script>

<!--[if lte IE 8]>
    <script>
        document.documentElement.className += ' is-ie-8';
        document.createElement('figure');
        document.createElement('header');
        document.createElement('nav');
        document.createElement('section');
        document.createElement('article');
        document.createElement('aside');
        document.createElement('footer');
    </script>
<![endif]-->

<!-- build:css styles/main-header.css -->
<link rel="stylesheet" href="styles/main-header.css">
<!-- endbuild -->

<!-- build:css styles/main-footer.css -->
<link rel="stylesheet" href="styles/main-footer.css">
<!-- endbuild -->

<!-- build:css styles/main.css -->
<link rel="stylesheet" href="styles/main-myft.css">
<!-- endbuild -->

<!-- build:css styles/main-ie-XL.css -->
<!--link rel="stylesheet" href="styles/main-ie-XL.css"-->
<!-- endbuild -->



<script type="text/javascript">
if(typeof startTime === "undefined"){
var startTime=new Date().getTime();
}
var adchID = '1000';
var dolRand = Math.round(Math.random()*1000000000);//定义slot随机数实现联动互斥功能
</script>

<!-- build:js scripts/key.js -->
<script type="text/javascript" src="scripts/key.js"></script>
<script type="text/javascript" src="scripts/ad.js"></script>
<!-- endbuild -->


 <link rel="icon" type="image/png" href="https://next-geebee.ft.com/assets/brand-alpha/icons/favicon-32x32.png" sizes="32x32">
 <link rel="icon" type="image/png" href="https://next-geebee.ft.com/assets/brand-alpha/icons/favicon-194x194.png" sizes="194x194">
 <link rel="apple-touch-icon" sizes="180x180" href="https://next-geebee.ft.com/assets/brand-alpha/icons/apple-touch-icon-180x180.png" />
 <meta name="msapplication-TileColor" content="#fff1e0" />
 <meta name="msapplication-TileImage" content="https://next-geebee.ft.com/assets/brand-alpha/icons/mstile-144x144.png" />
 <script>
 window.cutsTheMustard = (typeof Function.prototype.bind !== 'undefined');
 if (window.cutsTheMustard) {
 document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/, 'js').replace(/\bcore\b/, 'enhanced');
 }
 </script>
 
 <!--[if lte IE 8]>
 <link rel="stylesheet" href="https://next-geebee.ft.com/hashed-assets/front-page/35cf21f8/ie8.css" />
 <![endif]-->
 <script>var startTime = new Date().getTime();</script>
 <script>
 if ( screen.width<=480) {
 document.write('<meta content="FT中文网" name="application-name" /><meta content="app-id=443870811" name="apple-itunes-app" />');
 } else {
 document.write('<meta content="FT中文网" name="application-name" /><meta content="app-id=396124008" name="apple-itunes-app" />');
 }
 </script>
 <link rel="alternate" type="application/rss+xml" title="FT中文网 - 每日更新" href="/rss/feed" />
 <link rel="alternate" type="application/rss+xml" title="FT中文网 - 双语阅读" href="/rss/diglossia" />
 <link rel="alternate" type="application/rss+xml" title="FT中文网 - 今日焦点" href="/rss/news" />
 <link rel="alternate" type="application/rss+xml" title="FT中文网 - 生活时尚" href="/rss/lifestyle" />
 <link rel="alternate" type="application/rss+xml" title="FT中文网 - 一周十大热门文章" href="/rss/hotstoryby7day" />
 <link rel="alternate" type="application/rss+xml" title="FT中文网 - 热门用户评论" href="/rss/hotusercomment" />
 <link rel="search" type="application/opensearchdescription+xml" title="FT中文网财经搜索" href="/opensearch.xml">

 </head>
 <body>

<%include file="partials/header.html"%>
<%include file="./nav.html"%>
<%include file="./body.html"%>

<%include file="partials/footer.html"%>

<%include file="partials/QrCode.html"%>

</body>

<!--[if lte IE 8]>
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
<![endif]-->

<!-- build:js scripts/main.js -->
<script src="scripts/dom-delegate.js"></script>
<script src="scripts/main.js"></script>
<script src="scripts/o-nav.js"></script>
<!-- endbuild -->

</html>

