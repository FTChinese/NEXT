// MARK: - Show iOS App connection fail rate on Google Analytics Realtime
function calculateRadio() {
	var trs = document.getElementById('ID-eventPanel-Table').querySelectorAll('tbody tr');
	var appLaunches = 0;
	var failCount = 0;
	for (const tr of trs) {
		var ec = '';
		for (const td of tr.querySelectorAll('td')) {
			var span = td.querySelector('span');
			if (span) {
				var h = td.querySelector('span').innerHTML;
				if (['iPhone App Launch', 'CatchError'].indexOf(h) >= 0) {
					ec = h;
				}
			} else {
				var v = td.innerHTML;
				if (ec !== '' && /^[0-9,]+$/.test(v)) {
					v = v.replace(/,/g, '');
					var value = parseInt(v, 10);
					if (value > 0) {
						if (ec === 'iPhone App Launch' && appLaunches === 0) {
							appLaunches = value;
						} else if (ec === 'CatchError') {
							// console.log (value);
							// console.log (td);
							failCount += value;
						}
					}
				}
			}
		}
	}
	if (appLaunches > 0 && failCount > 0) {
		const failPercentage = Math.round(10000 * (failCount / appLaunches)) / 100; 
		const failPer = failPercentage + '%';
		console.clear();
		console.log (appLaunches + ' Launches and ' + failCount + ' Failures. ');
		console.log ('Fail/Launch is now: ' + failPer);
	}
}

setInterval(function() {
	calculateRadio();
}, 10000);
















function printRate() {
var tableRows = document.getElementById('ID-eventPanel-Table').querySelectorAll('tbody tr');
//console.log (tableRows);

var initiate = 0;
var request = 0;
var success = 0;
var successOnRetry = 0;
var failOnRetry = 0;
var fail = 0;
var pending = 0;

for (var i = 0; i<tableRows.length; i++) {
	//console.log (tableRows[i].querySelector('._GALM').innerHTML.replace(',', ''));
	var dataName = tableRows[i].querySelectorAll('td')[1].querySelector('span').innerHTML;
	var dataValue = tableRows[i].querySelector('._GALM').innerHTML.replace(',', '');
	dataValue = parseInt(dataValue, 10) || 0;
	if (dataName === 'initiate') {
		initiate += dataValue;
	} else if (dataName === 'Request') {
		request += dataValue;
	} else if (dataName === 'Success') {
		success += dataValue;
	} else if (dataName.indexOf('Success on Retry') >= 0) {
		successOnRetry += dataValue;
	} else if (dataName === 'Fail') {
		fail += dataValue;
	} else if (dataName === 'Fail on Retry5') {
		failOnRetry += dataValue;
	} else if (dataName === 'Request from Pending') {
		pending += dataValue;
	}
}


var requestRate = 100 * request / initiate;
requestRate = (Math.round(requestRate * 10))/10;
requestRate = requestRate + '% of Dolphin requests are executed';

var rate = 100 * (success + successOnRetry) / request;
rate = (Math.round(rate * 10))/10;
rate = 'Overall Success rate is ' + rate + '%';

var rateUplimit = 100 * (success + successOnRetry + failOnRetry) / request;
rateUplimit = (Math.round(rateUplimit * 10))/10;
rateUplimit = 'Overall Success rate cannot be more than ' + rateUplimit + '% no matter how many times you try. ';

var failRate = 100 * fail / request;
failRate = (Math.round(failRate * 10))/10;
failRate = 'First Time Fail rate is ' + failRate + '%';


var pendingRate = 100 * pending / request;
pendingRate = (Math.round(pendingRate * 10))/10;
pendingRate = pendingRate + '% requests are pending in 10 seconds';

var firstSuccessRate = 100 * (success) / request;
firstSuccessRate = (Math.round(firstSuccessRate * 10))/10;
firstSuccessRate = 'First Request Success rate is ' + firstSuccessRate + '%';

var retrySuccessRate = 100 * successOnRetry / request;
retrySuccessRate = (Math.round(retrySuccessRate * 10))/10;
retrySuccessRate = 'Recover ' + retrySuccessRate + '% through retry';

console.clear();
// console.log (request + ' requests, ' + success + ' succeed at once, ' + successOnRetry + ' succeed on retry. ');

console.log (requestRate);
console.log (firstSuccessRate);
console.log (failRate);
console.log (pendingRate);
//console.log (rateUplimit);
console.log (retrySuccessRate);
console.log (rate);
}

setInterval(printRate, 10000);