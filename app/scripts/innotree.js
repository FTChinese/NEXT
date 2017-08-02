/* jshint devel:true */
(function () {
'use strict';
var innotreeAPIRoot = '/index.php/jsapi/publish/innotree';
var gApiUrls = {
    'innotree': innotreeAPIRoot,
};
var gApiUrlsLocal = {
    'innotree': 'api/page/source.json'
};
if (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168') === 0 || window.location.hostname.indexOf('10.113') === 0 || window.location.hostname.indexOf('127.0') === 0) {
    gApiUrls = gApiUrlsLocal;
}
function renderNews(headline,companyProfile,reliability,shortName,time,money,round,firstIndustry,investor){
    var  newsHtml='<div id="item-container0" class="item-container XL4 L4 M12 M-half S6 P12 P-half has-image"><div class="item-inner" id="item-inner"><h2 class="item-headline"><a href="#">'+shortName+'</a></h2><div class="item-time">'+firstIndustry+'</div><div class="item-lead">'+headline+'</div><div class="item-lead">'+companyProfile+'</div><div class="item-time">'+time+'</div><div class="item-time">'+money+'</div><div class="item-time">'+round+'</div><div class="item-time">'+investor+'</div><div class="item-bottom"></div></div></div>';
    return newsHtml;
}
// function wrapAllNews(wrapNews){
//     var  wrapAllHtml=''+wrapNews+'<div class=" MT PT"></div>'+wrapNews+'<div class=" MT PT ST"></div>'+wrapNews+'<div class=" XLT LT MT PT"></div>'+wrapNews+'<div class=" MT PT ST"></div>'+wrapNews+'<div class=" MT PT"></div>'+wrapNews+'<div class=" XLT LT MT PT ST"></div>';
//     return wrapAllHtml;
// }
function renderList(title,wrapAllHtml){
    var  listHtml='<div class="list-container"><div class="list-inner"><h2 class="list-title"><a class="list-link">'+title+'</a></h2><div class="items">'+wrapAllHtml+'<div class="clearfloat"></div></div></div></div>';
    return listHtml;
}
function loadPublic() {
    $.ajax({
        type: 'get',
        url: gApiUrls.innotree,
        dataType: 'json',
        success: function (data) {
            // console.log(data);
            loadData1(data);
        },//success
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('errorThrown - [' + errorThrown + ']');
        }
    });//ajax
}//hanshu
function loadData1(data){
    var diffList=[];
    var listHtml0 = '';
    var newsHtml0 = '';
    var newsHtmls01 = [];
    var newsHtmls02 = [];
    var wrapAllHtml= []||'';
    var headline = '';
    var companyProfile = '';
    // var investmentShare = '';
    var reliability = '';
    var longName = '';
    var shortName = '';
    var time = '';
    var money = '';
    var round = '';
    var firstIndustry = '';
    var secondIndustry = '';
    var thirdIndustry = '';
    var investor = '';
    $.each(data.sections, function (key1, section) {
       newsHtmls02=[];
       $.each(section.lists, function (key2, list) {
            diffList.push(list.name);
       });
        $.each(section.lists, function (key2, list) {
            newsHtmls01=[];
            $.each(list.items, function (key3, item) {
                headline = item.headline;
                companyProfile = item.companyProfile || '';
                reliability = item.reliability;
                longName = item.longName || '';
                shortName = item.shortName || '';
                time = item.time || '';
                money = item.money || '';
                round = item.round|| '';
                firstIndustry = item.firstIndustry|| '';
                secondIndustry = item.secondIndustry|| '';
                thirdIndustry = item.thirdIndustry|| '';
                investor = item.investor || [];
                newsHtml0= renderNews(headline,companyProfile,reliability,shortName,time,money,round,firstIndustry,investor);
                newsHtmls01[key3]=newsHtml0;
            });//list.items
            newsHtmls02[key2]=newsHtmls01;
        });//section.lists
    });//data.sections

    for(var i = 0,leni=newsHtmls02.length;i<leni;i++){
        var myParseInt=parseInt((newsHtmls02[i].length)/6);
         wrapAllHtml[i]='';
        for(var j = 0,lenj=parseInt((newsHtmls02[i].length)/6);j<lenj;j++){
         wrapAllHtml[i]+= ''+(newsHtmls02[i][6*j]||'')+'<div class=" MT PT"></div>'+(newsHtmls02[i][(6*j+1)]||'')+'<div class=" MT PT ST"></div>'+(newsHtmls02[i][6*j+2]||'')+'<div class=" XLT LT MT PT"></div>'+(newsHtmls02[i][6*j+3]||'')+'<div class=" MT PT ST"></div>'+(newsHtmls02[i][6*j+4]||'')+'<div class=" MT PT"></div>'+(newsHtmls02[i][6*j+5]||'')+'<div class=" XLT LT MT PT ST"></div>';
        }
        switch((newsHtmls02[i].length)%6){
            case 1: wrapAllHtml[i]+= ''+(newsHtmls02[i][myParseInt*6]||'')+'<div class=" MT PT"></div>'; break;
            case 2: wrapAllHtml[i]+= ''+(newsHtmls02[i][myParseInt*6]||'')+'<div class=" MT PT"></div>'+(newsHtmls02[i][(6*myParseInt+1)]||'')+'<div class=" MT PT ST"></div>'; break;
            case 3: wrapAllHtml[i]+= ''+(newsHtmls02[i][myParseInt*6]||'')+'<div class=" MT PT"></div>'+(newsHtmls02[i][(6*myParseInt+1)]||'')+'<div class=" MT PT ST"></div>'+(newsHtmls02[i][6*myParseInt+2]||'')+'<div class=" XLT LT MT PT"></div>'; break;
            case 4: wrapAllHtml[i]+= ''+(newsHtmls02[i][6*myParseInt]||'')+'<div class=" MT PT"></div>'+(newsHtmls02[i][(6*myParseInt+1)]||'')+'<div class=" MT PT ST"></div>'+(newsHtmls02[i][6*myParseInt+2]||'')+'<div class=" XLT LT MT PT"></div>'+(newsHtmls02[i][6*myParseInt+3]||'')+'<div class=" MT PT ST"></div>';break;
            case 5: wrapAllHtml[i]+= ''+(newsHtmls02[i][6*myParseInt]||'')+'<div class=" MT PT"></div>'+(newsHtmls02[i][(6*myParseInt+1)]||'')+'<div class=" MT PT ST"></div>'+(newsHtmls02[i][6*myParseInt+2]||'')+'<div class=" XLT LT MT PT"></div>'+(newsHtmls02[i][6*myParseInt+3]||'')+'<div class=" MT PT ST"></div>'+(newsHtmls02[i][6*myParseInt+4]||'')+'<div class=" MT PT"></div>';break;
        }
        listHtml0+=renderList(diffList[i],wrapAllHtml[i]);
    }
      $('#content-inner').html(listHtml0);
}
loadPublic();
})(); 