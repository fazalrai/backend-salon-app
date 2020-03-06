var moment = require("moment");
//let x = moment("08:30 PM", "LLLL");
//console.log("value of x", x);
//let p = moment("12-25-1995", "MM-DD-YYYY");
//console.log(p);
//let f = "10:30";
//var time = moment.utc(f, "HH:mm");
//const time = moment.utc("10:30", "HH:mm");
/*var date1 = "2020-03-06";
var date2 = "2020-04-06";
const myMoment = moment(date1, "YYYY-MM-DD").format("LL");
const myMoment2 = moment(date2, "YYYY-MM-DD").format("LL");
*/

/*
var date1 = "2010-10-20";
var date2 = "2010-10-20";
var time1 = moment(date1).format("YYYY-MM-DD");
var time2 = moment(date2).format("YYYY-MM-DD");
if (time2 > time1) {
	console.log("date2 is Greter than date1");
} else if (time2 > time1) {
	console.log("date2 is Less than date1");
} else {
	console.log("Both date are same");
}


*/

//var time = moment.utc(start, "HH:mm"); //this is corect workin

//var result1 = moment("2020-03-06").format("DD/MMM/YYYY");
//console.log("result is ", myMoment2);

//time.add("1", "hours").add("20", "minutes");// true
//var result2 = moment(date1).format("DD/MMM/YYYY");
// if (moment(myMoment).isSame(myMoment2, "day")) {
// 	console.log("Both dates are equal");
// } else {
// 	console.log("Both are not equal");
// }
// time operations follow time-math logic
//var s = time.format("HH:mm");
var format = "HH:mm A";
var current_time = "09:25 AM";
var start_time = "08:34 AM";
var end_time = "10:34 AM";
current_time = moment(current_time, format);
start_time = moment(start_time, format);
end_time = moment(end_time, format);
// var time = moment() gives you current time. no format required.
// var time = moment("09:25 AM", format),
// 	beforeTime = moment("08:34 AM", format),
// 	afterTime = moment("10:34 AM", format);

if (current_time.isBetween(start_time, end_time)) {
	console.log("is between", current_time);
} else {
	console.log("is not between");
}

var date1 = "2010-10-20";
var date2 = "2010-10-20";

if (moment(date1).isSame(date2)) {
	console.log("dates are equla");
} else {
	console.log("dates are not equla");
}
//time = time.format("HH:mm A");
//var time2 = moment.format("10:50 AM", "HH:mm A");
//time.add(3, "hours"); // this is correct adding hours
//var s = time.format("HH:mm A");//this is correct adding time

// if (time.isBetween(beforeTime, afterTime)) {
// 	console.log("is between");
// } else {
// 	console.log("is not between");
// }
