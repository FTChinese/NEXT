function createCalendar() {
	var theday = new Date();
	updateCalendar(theday);
}
function updateCalendar(theday) {
	if (!document.getElementById('archive-calendar')) {
		return;
	}
	var thisday = new Date();
    var currentday, prevmonth, nextmonth, prevyear, nextyear, prevm, nextm, i, j, k, dateclass, dateLink, themonth, theyear;
    themonth = theday.getMonth() + 1;
    theyear = theday.getFullYear();
    prevmonth = themonth - 1;
    nextmonth = themonth + 1;
    if (prevmonth === 0) {
    	prevyear = theyear - 1;
    	prevmonth = 12;
    } else {
    	prevyear = theyear;
    }
    if (nextmonth === 13) {
    	nextyear = theyear + 1;nextmonth = 1;
    } else {
    	nextyear = theyear;
    }
    prevm = new Date(prevyear + '/' + prevmonth + '/1');
    nextm = new Date(nextyear + '/' + nextmonth + '/1');
    var calendarDaysHTML = '';
    for (i = 1; themonth === new Date(theday.getFullYear() + '/' + themonth + '/' + i).getMonth() + 1; i++) {
        if (i === 1) {
            k = new Date(theday.getFullYear() + '/' + themonth + '/' + i).getDay() - 1;
            for (j = 0; j <= k; j++) {
                //$('#calendar .days').append('<div>&nbsp;</div>');
                calendarDaysHTML += '<div>&nbsp;</div>';
            }
        }
        currentday = theday.getFullYear() + '-' + themonth + '-' + i;
        if (theday.getFullYear() * 10000 + theday.getMonth() * 100 + i === thisday.getFullYear() * 10000 + thisday.getMonth() * 100 + thisday.getDate()) {
            dateclass = 'highlight';
            dateLink = ' href="/archiver/'+ currentday + '"';
        } else if (theday.getFullYear() * 10000 + theday.getMonth() * 100 + i > new Date().getFullYear() * 10000 + new Date().getMonth() * 100 + new Date().getDate()) {
            dateclass = 'grey';
            dateLink = '';
        } else {
            dateclass = 'normal';
            dateLink = ' href="/archiver/'+ currentday + '"';
        }
        calendarDaysHTML += '<div><a value='+ currentday + ' class="' + dateclass + '"'+ dateLink +'>' + i + '</a></div>';
    }
    calendarDaysHTML += '<div class=clearfloat style="width:300px;height:15px;"></div>';
    var calendarHTML = '<div id="prev-month-link" class=floatleft><<</div><div id="next-month-link" class=floatright>>></div><div class=month>'+ theday.getFullYear() + '年'+ themonth + '月</div>';
    calendarHTML += '<div class=weekday><div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div></div><div class=days>'+calendarDaysHTML+'</div>';
    document.getElementById('archive-calendar').innerHTML = calendarHTML;
    document.getElementById('prev-month-link').onclick = function() {
    	updateCalendar(prevm, 1);
    };

    document.getElementById('next-month-link').onclick = function() {
    	updateCalendar(nextm, 1);
    };
}
createCalendar();
