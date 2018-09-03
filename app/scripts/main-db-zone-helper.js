/* exported parseUserkv, getDfpTargetingStr */
function parseUserkv(userKv) {
    //ver|201808;sex|102;cs|0;csp|0;hi|0;in|14
    var kvObj = {};
    var kvArr = userKv.split(';');
    if (kvArr.length === 0) {
        return;
    }
    kvArr.forEach(function(item){
        var oneKvArr = item.split('|');
        if (oneKvArr.length === 2) {
            kvObj[oneKvArr[0]] = oneKvArr[1];
        }
    });
    return kvObj;
}
function getDfpTargetingStr(kvObj) {
    var targetStr = '';
    if(kvObj.sex) {
        targetStr += 'cnsex=' + kvObj.sex + ';';
    }
    if(kvObj.cs) {
        targetStr += 'cncs=' + kvObj.cs + ';';
    }
    if(kvObj.csp) {
        targetStr += 'cncsp=' + kvObj.csp + ';';
    }
    if(kvObj.hi) {
        targetStr += 'cnhi=' + kvObj.hi + ';';
    }
    if(kvObj.in) {
        targetStr += 'cnin=' + kvObj.in + ';';
    }
    if(kvObj.wf) {
        targetStr += 'cnwf=' + kvObj.wf + ';';
    }
    return targetStr;
}