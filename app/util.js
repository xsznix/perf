'use strict';

exports.getMonthsInRange = function(startDate, endDate) {
	var year = startDate.getUTCFullYear();
	var month = startDate.getUTCMonth();
	var endYear = endDate.getUTCFullYear();
	var endMonth = endDate.getUTCMonth();

	var array = [];
	var i = 0;
	while(year != endYear || month != endMonth+1) {
		array[i] = year + '-' + (month + 1);
		i++;
		month++;
		if(month > 11) {
			year++;
			month = 0;
		}
	}
	console.log(array.toString());
	return array;
};