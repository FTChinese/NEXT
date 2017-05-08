function printRate() {
var tableRows = document.getElementById('ID-eventPanel-Table').querySelectorAll('tbody tr');
//console.log (tableRows);

var request = 0;
var success = 0;
var successOnRetry = 0;
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
	} else if (dataName === 'Success on Retry') {
		successOnRetry += dataValue;
	} else if (dataName === 'Fail') {
		fail += dataValue;
	}
}

var rate = 100 * (success + successOnRetry) / request;
rate = (Math.round(rate * 10))/10;
rate = 'Overall Success rate is ' + rate + '%';

var failRate = 100 * fail / request;
failRate = (Math.round(failRate * 10))/10;
failRate = 'First Time Fail rate is ' + failRate + '%';

var firstSuccessRate = 100 * (success) / request;
firstSuccessRate = (Math.round(firstSuccessRate * 10))/10;
firstSuccessRate = 'First Request Success rate is ' + firstSuccessRate + '%';

console.clear();
console.log (request + ' requests, ' + success + ' succeed at once, ' + successOnRetry + ' succeed on retry. ');
console.log (firstSuccessRate);
console.log (failRate);
console.log (rate);
}

setInterval(printRate, 10000);