/* exported queryReports, queryGAData*/
// Replace with your view ID.
//var VIEW_ID = '10995661';
var VIEW_ID = '69390283';
var gGADataStatus = '';
var startDate = '7daysAgo';
var endDate = 'today';
var queryJSON = {};
var textnode;
var textnode2;
var textnode3;
function findContainer(ele) {
  var eleContainer = ele;
  var i = 0;
  do {
    eleContainer = eleContainer.parentNode;
    i ++;
  } while (eleContainer.className.indexOf('item-inner')<0 && eleContainer.className.indexOf('links')<0 && !/^li$/i.test(eleContainer.tagName) && i<10);
  if (eleContainer.className.indexOf('links')>=0) {
    //console.log ('links');
    return ele;
  } else {
    return eleContainer;
  }
}

function getPercentage(v, t) {
  var p = v;
  p = 10000 * p/t;
  p = Math.round(p)/100;
  p = p + '%';
  return p;
}

function displayResults(response) {
  try {
        var formattedJson = JSON.stringify(response.result, null, 2);
        textnode3.style.display = 'block';
        textnode.style.backgroundColor = 'white';
        textnode.value = formattedJson;
  } catch (ignore) {

  }
  var data;
  var total;
  var totalPV;
  var overallClickRate;
  var inViewData;
  if (/127.0|localhost|192.168/.test(window.location.href)) {
    data = response.reports[0].data.rows;
    total = response.reports[0].data.totals[0].values[0];
    totalPV = response.reports[1].data.totals[0].values[0];
    inViewData = response.reports[2].data;
  } else {
    data = response.result.reports[0].data.rows;
    total = response.result.reports[0].data.totals[0].values[0];
    totalPV = response.result.reports[1].data.totals[0].values[0];
    inViewData = response.result.reports[2].data;
  }
  overallClickRate = Math.round(10000 * total/totalPV)/10000;

  document.getElementById('show-click-rate').innerHTML = overallClickRate;
  document.getElementById('show-click-rate').style.color = '#c36256';
  document.getElementById('show-click-total').innerHTML = total;
  document.getElementById('show-click-total').style.color = '#c36256';
  document.getElementById('show-page-view').innerHTML = totalPV;
  document.getElementById('show-page-view').style.color = '#c36256';
  //alert (overallClickRate);
  for (var i=0; i<data.length; i++) {
    var key = data[i].dimensions[0];
    var value = data[i].metrics[0].values[0];
    var ele = document.querySelector('[data-el='+ key +']');
    var p;
    var p1;
    var eleContainer;
    var gaData;
    var isSide = '';
    if (ele !== null && value >0 && total >0) {
      //console.log (key + ':' + value);
      p1 = value/totalPV;
      p1 = Math.sqrt(p1) * 100;
      p1 = p1 + '%';
      p = getPercentage(value, totalPV);
      ele.title = value;
      eleContainer = findContainer(ele);
      if (key.indexOf('Side')===0) {
        isSide = ' is-side-data';
      }
      gaData = '<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;min-height:44px;overflow:visible;width:100%;cursor:pointer;" class="ga-data-show'+isSide+'" data-value="'+ value +'" title="'+ value +' Clicks ('+p+')"><div style="position:absolute;top:0;left:15px;right:15px;bottom:15px;background:rgba(0,0,0,0.95);color:white;z-index:999999999;"><div style="margin:auto;position:absolute;top:0;left:0;right:0;bottom:0;width:'+ p1 +';height:'+p1+';background:green;width:'+p+';"></div><div style="padding: 5px 0 0 10px;" >'+value+'</div><div style="position:absolute;right:10px;bottom:10px;">'+p+'</div></div></div>';
      //console.log (eleContainer);
      eleContainer.style.position = 'relative';
      eleContainer.style.overflow = 'visible';
      eleContainer.innerHTML = gaData + eleContainer.innerHTML;
    }
  }

  

  var blocks = document.querySelectorAll('.block-container');
  for (var j=0; j<blocks.length; j++) {
    //alert (blocks[j].innerHTML);
    var clickData = blocks[j].querySelectorAll('.ga-data-show');
    var blockClicks = 0;
    var mainClicks = 0;
    var sideClicks = 0;
    var blockGAData;
    var blockClicksP;
    var blockClicksMore='';
    var textnode4;

    for (var k=0; k<clickData.length; k++) {
      //console.log (clickData);
      var itemClick = clickData[k].getAttribute('data-value') || 0;
      itemClick = parseInt(itemClick);
      blockClicks += itemClick;
      if (clickData[k].className.indexOf('is-side-data')>=0) {
        sideClicks += itemClick;
      } else {
        mainClicks += itemClick;
      }
    }
    if (blockClicks >0) {
      blockClicksP = getPercentage(blockClicks, totalPV);
      if (sideClicks>0) {
        blockClicksMore = ' ' + mainClicks + ' on main (' + getPercentage(mainClicks, total) + '). ' + sideClicks + ' on side. (' + getPercentage(sideClicks, total) + ')';
      }
      blockGAData = '<div click-rate="'+blockClicksP+'" title="Total Clicks on this Block: '+ blockClicks +' ('+blockClicksP + '). ' +blockClicksMore+'" class="ga-data-show-block" style="position:absolute;top:0;right:30px;width:150px;height:90px;padding-left:5px;line-height:30px;text-align:left;background:#c36256;color:white;z-index:999999999;cursor:pointer;">点击率：'+blockClicksP+'</div>';
      blocks[j].style.position = 'relative';
      textnode4 = document.createElement('div');
      textnode4.innerHTML = blockGAData;
      blocks[j].appendChild(textnode4); 

      //blocks[j].innerHTML = blockGAData + blocks[j].innerHTML;
    }
  }


  //var inViewData = document.getElementById('in-view-data');
  var maxView = inViewData.maximums[0].values[0];
  var inViewHTML = '<b>页面各板块展示率：</b><br>';
  for (var l=0; l<inViewData.rows.length; l++) {
    var id = inViewData.rows[l].dimensions[0].replace(/\//g,'');
    var v = inViewData.rows[l].metrics[0].values[0];
    var ratio = Math.round(10000 * v/maxView)/100 + '%';
    var cBlock = document.querySelector('[data-id='+id+']');
    var blockGAData1;
    var textnode5;
    var clickEfficiency = '';
    var bHeight = 0;
    if (id.indexOf('block-')===0 && cBlock.querySelector('.list-link')) {
      id = cBlock.querySelector('.list-link').innerHTML;
    }
    inViewHTML += '<div style="margin:10px 0;position:relative;width:100%;height:30px;"><div style="position:absolute;top:0;bottom:0;width: '+ratio+';background:#c36256;"></div><div style="position:absolute;top:0;left:0;right:0;bottom:0;padding:5px;">'+id+': '+v+', ' + ratio +'</div></div>';
    if (cBlock) {
      if (cBlock.querySelector('.ga-data-show-block')) {

        clickEfficiency = cBlock.querySelector('.ga-data-show-block').getAttribute('click-rate').replace(/%/g,'');
        clickEfficiency = Number(clickEfficiency);
        bHeight = cBlock.offsetHeight;
        if (bHeight >0 ) {
          clickEfficiency = 10000 * clickEfficiency * maxView/(bHeight * v);
          clickEfficiency = Math.round(clickEfficiency);
        } else {
          clickEfficiency = '';
        }
        cBlock.querySelector('.ga-data-show-block').innerHTML = '展示率：' + ratio + '<br>' + cBlock.querySelector('.ga-data-show-block').innerHTML + '<br>效率指数: ' + clickEfficiency;
      } else {
        blockGAData1 = '<div class="ga-data-show-block" style="position:absolute;top:0;right:30px;width:150px;height:30px;line-height:30px;padding-left:5px;background:#c36256;color:white;z-index:999999999;cursor:pointer;">展示率：'+ratio+'</div>';
        cBlock.style.position = 'relative';
        textnode5 = document.createElement('div');
        textnode5.innerHTML = blockGAData1;
        cBlock.appendChild(textnode5); 
      }
    }
  }
  document.getElementById('in-view-data').innerHTML = inViewHTML;
}




// Query the API and print the results to the page.
function queryReports() {
  queryJSON = {
      reportRequests: [
        {
          viewId: VIEW_ID,
          dateRanges: [
            {
              startDate: startDate,
              endDate: endDate
            }
          ],
          metrics: [
            {
              expression: 'ga:totalEvents'
            }
          ],
          dimensions:
          [
            {
              name: 'ga:eventLabel'
            }
          ],
          dimensionFilterClauses: [
            {
              operator: 'AND',
              filters: [
                {
                  dimensionName: 'ga:eventAction',
                  operator: 'EXACT',
                  expressions: ['home']
                },
                {
                  dimensionName: 'ga:eventCategory',
                  operator: 'EXACT',
                  expressions: ['Click']
                }
              ]
            }
          ],
          orderBys: [
            {fieldName: 'ga:eventLabel'}
          ]
        },
        {
          viewId: VIEW_ID,
          dateRanges: [
            {
              startDate: startDate,
              endDate: endDate
            }
          ],
          metrics: [
            {
              expression: 'ga:pageviews'
            }
          ],
          dimensionFilterClauses: [
            {
              operator: 'AND',
              filters: [
                {
                  dimensionName: 'ga:pagePath',
                  operator: 'REGEXP',
                  expressions: ['^(\/|\/index.php)$']
                }
              ]
            }
          ]
        },
        {
          viewId: VIEW_ID,
          dateRanges: [
            {
              startDate: startDate,
              endDate: endDate
            }
          ],
          metrics: [
            {
              expression: 'ga:totalEvents'
            }
          ],
          dimensions: [
            {
              name: 'ga:eventLabel'
            }
          ],
          dimensionFilterClauses: [
            {
              operator: 'AND',
              filters: [
                {
                  dimensionName: 'ga:eventAction',
                  operator: 'EXACT',
                  expressions: [
                    'In View'
                  ]
                },
                {
                  dimensionName: 'ga:eventCategory',
                  operator: 'EXACT',
                  expressions: [
                    'home'
                  ]
                }
              ]
            }
          ],
          orderBys:
          [
            {fieldName: 'ga:totalEvents', sortOrder: 'DESCENDING'}
          ]
        }
      ]
    };

  textnode2.value = JSON.stringify(queryJSON, null, 2);

  gapi.client.request({
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: queryJSON
  }).then(displayResults, console.error.bind(console));
}



// Query the API and print the results to the page.
function queryReports2() {
  queryJSON = JSON.parse(textnode2.value);
  textnode.style.backgroundColor = 'grey';
  textnode.value = '更新数据...';
  //console.log (queryJSON);
  gapi.client.request({
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: queryJSON
  }).then(displayResults, console.error.bind(console));
}


function queryReportsTest() {
  var xhr = new XMLHttpRequest();
  var ajaxMethod = 'GET';
  var ajaxUrl = '/api/ga/home-clicks.json';
  var message = {};
  xhr.open(ajaxMethod, encodeURI(ajaxUrl));
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
      if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          displayResults(data);
      }  
  };
  xhr.send(JSON.stringify(message));
  textnode2.value = JSON.stringify(queryJSON, null, 2);
}

function fixDateFormat(originalDate) {
  var newDate = originalDate.replace(/\//g,'-').replace(/\-([0-9])\-/g,'-0$1-').replace(/\-([0-9])$/g,'-0$1');
  return newDate;
}

function queryGAData() {
  var ele;
  var toggoleButton = document.getElementById('show-ga-data');
  var s = document.getElementById('ga-start-date').value || '';
  var e = document.getElementById('ga-end-date').value || '';

  if (gGADataStatus === '') {
    if (/^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}$/.test(s)) {
      startDate = fixDateFormat(s);
    }
    if (/^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}$/.test(e)) {
      endDate = fixDateFormat(e);
    }
    document.getElementById('ga-start-date').value = startDate;
    document.getElementById('ga-end-date').value = endDate;
    document.getElementById('ga-start-date').readOnly = true;
    document.getElementById('ga-end-date').readOnly = true;
    if (/127.0|localhost|192.168/.test(window.location.href)) {
        queryReportsTest();
    } else {
        (function (d) {
                var js, s = d.getElementsByTagName('script')[0];
                js = d.createElement('script');
                js.async = true;
                js.src = 'https://apis.google.com/js/client:platform.js';
                s.parentNode.insertBefore(js, s);
        })(window.document);
    }
    toggoleButton.innerHTML = '隐藏点击数据';
    gGADataStatus = 'show';
  } else if (gGADataStatus === 'show') {
    ele = document.querySelectorAll('.ga-data-show, .ga-data-show-block');
    for (var i=0; i<ele.length; i++) {
      ele[i].style.display = 'none';
    }
    toggoleButton.innerHTML = '显示点击数据';
    //document.querySelectorAll('.ga-data-show').style.display = 'none';
    gGADataStatus = 'hide';
  } else if (gGADataStatus === 'hide') {
    ele = document.querySelectorAll('.ga-data-show, .ga-data-show-block');
    for (var j=0; j<ele.length; j++) {
      ele[j].style.display = 'block';
    }
    toggoleButton.innerHTML = '隐藏点击数据';
    //document.querySelectorAll('.ga-data-show').style.display = 'none';
    gGADataStatus = 'show';
  }
}

if ( /showHotClick=yes/.test(window.location.href)) {
  var firstAdContainer = document.querySelector('.bn-ph');
  var gaContainer = document.createElement('div');
  gaContainer.id = 'ga-container';
  gaContainer.style.margin = '0 auto 15px auto';
  gaContainer.style.maxWidth = '1200px';
  firstAdContainer.parentNode.insertBefore(gaContainer, firstAdContainer);
  gaContainer.innerHTML = '<div class="g-signin2" data-onsuccess="queryReports"></div><div>Start Date: <input id="ga-start-date" type="text" placeholder="YYYY-MM-DD"> End Date: <input id="ga-end-date" type="text" placeholder="YYYY-MM-DD"> <button id="show-ga-data" onclick="queryGAData()">显示点击数据</button> Clicks per Page：<span id="show-click-rate">...</span>  Clicks：<span id="show-click-total">...</span>  Page View：<span id="show-page-view">...</span></div><div id="in-view-data"></div>';

  var node = document.body;
  textnode = document.createElement('textarea');
  textnode.id =  'query-output';
  textnode.style.width = '100%';
  textnode.style.maxWidth = '1200px';
  textnode.style.margin = 'auto';
  textnode.style.display = 'block';
  textnode.style.height = '300px';

  textnode2 = document.createElement('textarea');
  textnode2.id =  'query-input';
  textnode2.style.width = '100%';
  textnode2.style.height = '300px';
  textnode2.style.maxWidth = '1200px';
  textnode2.style.margin = 'auto';
  textnode2.style.display = 'block';

  textnode3 = document.createElement('button');
  textnode3.id =  'query-rerun';
  textnode3.innerHTML = '查询';
  textnode3.style.margin = '15px auto';
  textnode3.style.display = 'none';
  textnode3.style.width = '250px';
  textnode3.onclick = queryReports2;


  node.appendChild(textnode2); 
  node.appendChild(textnode3); 
  node.appendChild(textnode); 

  document.querySelectorAll('.app-download-container')[0].style.display = 'none';
  document.querySelectorAll('.app-download-container')[1].style.display = 'none';
}