'use strict';

// return an array of strings representing the months that include the start and end date
exports.getMonthsInRange = function getMonthsInRange(startDate, endDate) {
	var array = [];
	var i = 0;
	var date = startDate;
	var end = this.nextMonth(endDate);
	while(date.getUTCFullYear() < endDate.getUTCFullYear()
		|| date.getUTCMonth() < endDate.getUTCMonth()+1) {
		array[i] = this.formatDate(date);
		date = this.nextMonth(date);
		i++;
	}

	console.log(array.toString());
	return array;
};

// returns the YYYY-MM formatted string of a date
exports.formatDate = function formatDate(date) {
	return date.getUTCFullYear() + "-" + (date.getUTCMonth()+1);
}

// returns the Date representing the first day of the previous month.
exports.previousMonth = function previousMonth(date) {
	return new Date(date.getUTCFullYear(), date.getUTCMonth()-1, 1);
}

// returns the Date representing the first day of the next month.
exports.nextMonth = function nextMonth(date) {
	return new Date(date.getUTCFullYear(), date.getUTCMonth()+1, 1);
}

exports.parseCurr = function parseCurr(money) {
	var symidx;
	if ((symidx = money.indexOf(currencySymbol)) != -1)
		money = money.slice(symidx + currencySymbol.length);
	return Math.round(parseFloat(money) * 100);
}

var currencySymbol = '';
exports.setCurrencySymbol = function setCurrencySymbol(symbol) {
	currencySymbol = symbol;
}

exports.currToString = function currToString(money) {
	return currencySymbol + (money / 100).toFixed(2);
}