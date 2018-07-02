function postVal(obj){
    var userId = GetCookie('USER_ID') || '';
    if (!!userId){
        var xhrpw = new XMLHttpRequest();
        xhrpw.open('post', '/engagement.php');
        xhrpw.setRequestHeader('Content-Type', 'application/text');
        xhrpw.onload = function() {
            if (xhrpw.status === 200) {
                console.log('请求成功:');
            } else {
                alert('请求失败！');
            }
        };     
        xhrpw.send(JSON.stringify(obj));
    }
}

function getBrowserTime(){
    var timeIn = '';
    window.onload = function () {
        timeIn = (new Date()).getTime();
        var dataArr = {
            'url' : location.href,
            'refer' : document.referrer,
            'timeIn' : timeIn,
            'timeOut' : new Date().getTime(),
            'userId' : GetCookie('USER_ID') || null,
            'functionName':'onload'
        };
        // if(GetCookie('USER_ID')){
            postVal(dataArr);
        // }
        
    };

    window.onbeforeunload = function() {
        var dataArr = {
            'url' : location.href,
            'refer' : document.referrer,
            'timeIn' : timeIn,
            'timeOut' : new Date().getTime(),
            'userId' : GetCookie('USER_ID') || null,
            'functionName':'onbeforeunload'
        };
        postVal(dataArr);
    };
}
getBrowserTime();
