function printRate() {
var tableRows = document.getElementById('ID-eventPanel-Table').querySelectorAll('tbody tr');
//console.log (tableRows);

var request = 0;
var success = 0;
var successOnRetry = 0;
var failOnRetry = 0;
var fail = 0;

for (var i = 0; i<tableRows.length; i++) {
	//console.log (tableRows[i].querySelector('._GALM').innerHTML.replace(',', ''));
	var dataName = tableRows[i].querySelectorAll('td')[1].querySelector('span').innerHTML;
	var dataValue = tableRows[i].querySelector('._GALM').innerHTML.replace(',', '');
	dataValue = parseInt(dataValue, 10) || 0;
	if (dataName === 'Request') {
		request += dataValue;
	} else if (dataName === 'Success') {
		success += dataValue;
	} else if (dataName.indexOf('Success on Retry') >= 0) {
		successOnRetry += dataValue;
	} else if (dataName === 'Fail') {
		fail += dataValue;
	} else if (dataName === 'Fail on Retry5') {
		failOnRetry += dataValue;
	}
}

var rate = 100 * (success + successOnRetry) / request;
rate = (Math.round(rate * 10))/10;
rate = 'Overall Success rate is ' + rate + '%';

var rateUplimit = 100 * (success + successOnRetry + failOnRetry) / request;
rateUplimit = (Math.round(rateUplimit * 10))/10;
rateUplimit = 'Overall Success rate cannot be more than ' + rateUplimit + '% no matter how many times you try. ';

var failRate = 100 * fail / request;
failRate = (Math.round(failRate * 10))/10;
failRate = 'First Time Fail rate is ' + failRate + '%';

var firstSuccessRate = 100 * (success) / request;
firstSuccessRate = (Math.round(firstSuccessRate * 10))/10;
firstSuccessRate = 'First Request Success rate is ' + firstSuccessRate + '%';

var retrySuccessRate = 100 * successOnRetry / request;
retrySuccessRate = (Math.round(retrySuccessRate * 10))/10;
retrySuccessRate = 'Recover ' + retrySuccessRate + '% through retry. ';

console.clear();
// console.log (request + ' requests, ' + success + ' succeed at once, ' + successOnRetry + ' succeed on retry. ');
console.log (firstSuccessRate);
console.log (failRate);
//console.log (rateUplimit);
console.log (retrySuccessRate);
console.log (rate);
}

setInterval(printRate, 10000);