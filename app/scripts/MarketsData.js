var marketsDataEle = document.getElementById('markets-data');
var marketsDataDelivered = false;

function getftdata(s) {
    s=s.replace(/:/g,'%3A').replace(/\s/g,'').replace(/\%E2\%80\%8E/g,'');
    var scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'http://markets.ft.com/markets/data/getSymbolHover.asp?s=' + s + '&callback=updateContent&..contentType..=text%2Fjavascript&context=window._wsodSymbolHover&');
    document.body.appendChild(scriptEl);
}

function wtd(thesymbol,chinese,evenodd) {
    var evenoddclass='';
	var trstart='';
	var trend='';
	var thesymbol1=thesymbol.substring(1,20).replace(/\-mh\-/g,':').replace(/\-dot\-/g,'.').replace(/\-at\-/g,'@');
    var thesymbol2='p' + thesymbol;
    var placeHolderTd = '';
    if (evenodd===1) {
        placeHolderTd = '<td class="placeholder-td">&nbsp;</td>';
        evenoddclass=' secondary-column';
        trend='</tr>';
    } else {
        trstart='<tr>';
    }
    return trstart + placeHolderTd + '<td class="text' + evenoddclass + '"><a target="_blank"  href="http://markets.ft.com/tearsheets/performance.asp?s=' + thesymbol1 + '">' + chinese + '</a></td><td class="last' + evenoddclass + '"><span class="dataValue" id=' + thesymbol + '>...</span></td><td class="pct-change' + evenoddclass + '"><span class="dataValue" id=' + thesymbol2 + '>...</span></td>' + trend;
}

function tab1() {
    var tabHTML = '';
    var listTitle = '全球股市';
    var listLink = '/channel/stock.html';
    tabHTML += wtd('iSHI-mh-SHH','上证综指',0);
    tabHTML += wtd('iHSI-mh-HKG','香港恒生',1);
    tabHTML += wtd('iDJI-mh-DJI','道琼斯',0);
    tabHTML += wtd('iINX-mh-IOM','标普500',1);
    tabHTML += wtd('iCOMP-mh-NAS','纳斯达克',0);
    tabHTML += wtd('iIXTA-mh-TAI','台湾加权',1);
    tabHTML += wtd('in225-mh-NIK','日经225',0);
    tabHTML += wtd('iDAXX-mh-GER','DAX',1);
    return '<div class="list-container XL4 L12 M12 S12 P12 side-by-side"><div class="list-inner"><h2 class="list-title"><a class="list-link" href="'+listLink+'">'+listTitle+'</a></h2><div class="items"><div class="item-container side-by-side no-image"><div class="item-inner" id="markets-stock"><table class="markets-data">' + tabHTML + '</table></div></div></div></div></div>';
}

function tab2() {
    var tabHTML = '';
    var listTitle = '重要汇率';
    var listLink = '/channel/forex.html';
    tabHTML += wtd('iUSDCNY','美元/人民币',0);
    tabHTML += wtd('iUSDJPY','美元/日元',1);
    tabHTML += wtd('iEURUSD','欧元/美元',0);
    tabHTML += wtd('iGBPUSD','英镑/美元',1);
    tabHTML += wtd('iUSDCHF','美元/瑞郎',0);
    tabHTML += wtd('iUSDHKD','美元/港元',1);
    tabHTML += wtd('iAUDUSD','澳元/美元',0);
    tabHTML += wtd('iUSDCAD','美元/加元',1);
    return '<div class="list-container XL4 L12 M12 S12 P12 side-by-side"><div class="list-inner"><h2 class="list-title"><a class="list-link" href="'+listLink+'">'+listTitle+'</a></h2><div class="items"><div class="item-container side-by-side no-image"><div class="item-inner" id="markets-stock"><table class="markets-data">' + tabHTML + '</table></div></div></div></div></div>';
}

function tab3() {
    var tabHTML = '';
    var listTitle = '大宗商品';
    var listLink = '/channel/forex.html';
    tabHTML += wtd('iIB-dot-1-mh-IEU','布伦特原油',0);
    tabHTML += wtd('iCL-dot-1-mh-NYM','WTI原油',1);
    tabHTML += wtd('iUS-at-RB-dot-1-mh-NYM','RBOB汽油',0);
    tabHTML += wtd('iGC-dot-1-mh-CMX','黄金',1);
    tabHTML += wtd('iUS-at-SI-dot-1-mh-CMX','银',0);
    tabHTML += wtd('iUS-at-HG-dot-1-mh-CMX','铜',1);
    tabHTML += wtd('iSC1-mh-CBT','大豆',0);
    tabHTML += wtd('iWC1-mh-CBT','小麦',1);
    return '<div class="list-container XL4 L12 M12 S12 P12 side-by-side"><div class="list-inner"><h2 class="list-title"><a class="list-link" href="'+listLink+'">'+listTitle+'</a></h2><div class="items"><div class="item-container side-by-side no-image"><div class="item-inner" id="markets-stock"><table class="markets-data">' + tabHTML + '</table></div></div></div></div></div>';
}


function updatetab1() {
    getftdata('SHI:SHH');
    getftdata('HSI:HKG');
    getftdata('DJI:DJI');
    getftdata('INX:IOM');
    getftdata('IXTA:TAI');
    getftdata('n225:NIK');
    getftdata('COMP:NAS');
    getftdata('DAXX:GER');
}

function updatetab2() {
    getftdata('USDCNY');
    getftdata('USDJPY');
    getftdata('EURUSD');
    getftdata('GBPUSD');
    getftdata('USDCHF');
    getftdata('USDHKD');
    getftdata('AUDUSD');
    getftdata('USDCAD');
}

function updatetab3() {
    getftdata('IB.1:IEU');
    getftdata('CL.1:NYM');
    getftdata('US@RB.1:NYM');
    getftdata('GC.1:CMX');
    getftdata('US@SI.1:CMX');
    getftdata('US@HG.1:CMX');
    getftdata('SC1:CBT');
    getftdata('WC1:CBT');
}

function refreshData() {
    var marketsDataTop = findTop(marketsDataEle);
    var marketsDataHeight = marketsDataEle.offsetHeight;
    if ((scrollTop + bodyHeight - marketsDataTop > -900 && scrollTop - marketsDataHeight - marketsDataTop < 0) || marketsDataDelivered === false) {
        updatetab1();
        updatetab2();
        updatetab3();
        marketsDataDelivered = true;
    // console.log (scrollTop + bodyHeight - marketsDataTop);
    // console.log (scrollTop - marketsDataHeight - marketsDataTop);
    }
}

window._wsodSymbolHover = {};
window._wsodSymbolHover.updateContent = function(str1, str2) {
    var lp = str2.replace(/.*lastPrice.{1,5}span[^>]*>([^<^>]*)<.*/g, '$1');
    var pc = '';
    var lpId = '';
    var pcId = '';
    var piId;
    if (str2.indexOf('%') > 0) {
        pc = str2.replace(/.*>([^<]*\%)<.*/g, '$1');
    }
    if (str2.indexOf('currently unavailable') > 0) {} else {
        lpId = 'i' + str1.replace(/:/g, '-mh-').replace(/\./g, '-dot-').replace(/\@/g, '-at-');
        pcId = 'p' + lpId;
        document.getElementById(lpId).innerHTML = lp;
        document.getElementById(pcId).innerHTML = pc;
    }
    piId = document.getElementById('pi' + str1.replace(/:/g, '-mh-').replace(/\./g, '-dot-').replace(/\@/g, '-at-'));
    if (str2.indexOf('negChange') > 0) {
        piId.className = 'dataValue negChange';
    } else if (str2.indexOf('posChange') > 0) {
        piId.className = 'dataValue posChange';
    }
};



marketsDataEle.innerHTML = tab1() + tab2() +tab3() + '<div class="clearfloat"></div><div class="item-lead item-note">以上数据由巨灵财经和FT.com提供</div>';
refreshData();
setInterval(function(){
    refreshData();
}, 30000);