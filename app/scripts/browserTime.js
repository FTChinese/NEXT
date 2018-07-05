/* jshint ignore:start */
/*esversion: 6 */
function postVal(obj) {
    var userId = GetCookie('USER_ID') || '';
    if (!!userId) {
        var xhrpw = new XMLHttpRequest();
        xhrpw.open('post', '/engagement.php');
        xhrpw.setRequestHeader('Content-Type', 'application/text');
        xhrpw.onload = function () {
            if (xhrpw.status === 200) {
                console.log('请求成功:');
            } else {
                console.log('请求失败！');
            }
        };
        xhrpw.send(JSON.stringify(obj));
    }
}

var ipAddress = '';
var addrs = Object.create(null);
    addrs['0.0.0.0'] = false;
function updateDisplay(newAddr) {
    if (newAddr in addrs) {
        return;
    }else {
        addrs[newAddr] = true;
    }
    var displayAddrs = Object.keys(addrs).filter(
        function (k) { 
            return addrs[k]; 
        });
    for (var i = 0; i < displayAddrs.length; i++) {
        if (displayAddrs[i].length > 16) {
            displayAddrs.splice(i, 1);
            i--;
        }
    }
    ipAddress = displayAddrs[0];
    return displayAddrs[0];
    console.log('addr:' + displayAddrs[0]);
}

function grepSDP(sdp) {
    var hosts = [];
    sdp.split('\r\n').forEach(function (line, index, arr) {
        if (~line.indexOf('a=candidate')) {
            var parts = line.split(' '),
                addr = parts[4],
                type = parts[7];
            if (type === 'host') {
               updateDisplay(addr);
            }
        } else if (~line.indexOf('c=')) {
            var parts = line.split(' '),
                addr = parts[2];
            updateDisplay(addr);

        }
    }); 
}
function getRTC(){
    var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    if (RTCPeerConnection){
        var rtc = new RTCPeerConnection({ iceServers: [] });
        if (1 || window.mozRTCPeerConnection) {
            rtc.createDataChannel('', { reliable: false });
        };

        rtc.onicecandidate = function (evt) {
            if (evt.candidate) {
                grepSDP('a=' + evt.candidate.candidate);
            }
        };
        rtc.createOffer(function (offerDesc) {
            grepSDP(offerDesc.sdp);
            rtc.setLocalDescription(offerDesc);
        }, function (e) { 
            console.warn('offer failed', e); 
        });   
    }else{
        console.log('不支持RTCPeerConnection');
    };
}
getRTC();
function getBrowserTime() {
    var timeIn = '';
    window.onload = function () {
        getRTC();
        timeIn = (new Date()).getTime();
        var dataArr = {
            'ipAddress': ipAddress,
            'url': location.href,
            'refer': document.referrer,
            'timeIn': timeIn,
            'timeOut': new Date().getTime(),
            'userId': GetCookie('USER_ID') || null,
            'functionName': 'onload'
        };
        postVal(dataArr);
    };

    window.onbeforeunload = function () {
        var dataArr = {
            'ipAddress': ipAddress,
            'url': location.href,
            'refer': document.referrer,
            'timeIn': timeIn,
            'timeOut': new Date().getTime(),
            'userId': GetCookie('USER_ID') || null,
            'functionName': 'onbeforeunload'
        };
        postVal(dataArr);
    };
}
getBrowserTime();

/* jshint ignore:end */
