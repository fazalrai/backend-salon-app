const monogoes = require("mongoose");
const express = require("express");
//var moment = require("moment");
const Moment = require("moment");
const MomentRange = require("moment-range");

const moment = MomentRange.extendMoment(Moment);
const jwt = require("jsonwebtoken");
const { SalonServicesTable } = require("./saloonServices");
const { SalonTable } = require("./Salon_signup");
const ServiceAppointmentRouter = express.Router();
//  "preset": "jest-expo"
const ServiceAppointmentSchema = new monogoes.Schema({
	customer_id: {
		type: String
		//required: true
	},
	service_id: {
		type: String
		//required: true
	},
	service_status: {
		type: String,
		//required: false,
		enum: ["availed", "onqueue"]
	},
	booking_date: {
		type: Date
		//	required: true
	},
	stating_time: {
		type: String
		//	required: true
	},
	ending_time: {
		type: String
		//	required: true
	},
	Salon_id: {
		type: String
		//	required: true
	}

	//booking_date: {
	//	type: Date,
	//	require: true
	//},
});
const ServiceAppointmentTable = monogoes.model(
	"ServiceAppointmentTable",
	ServiceAppointmentSchema
);

ServiceAppointmentRouter.post("/:id", async (req, res, next) => {
	try {
		console.log("hello", req.params.id);
		const Salon_id = await SalonServicesTable.findOne({
			_id: req.params.id
		}).select({ Salon_id: 1, service_time: 1, _id: 0 });

		//console.log("salon id is", Salon_id.Salon_id);
		//	const a = await SalonTable.find();
		const Salon_timings = await SalonTable.findOne({
			_id: Salon_id.Salon_id
		}).select({
			Salon_opening_hours: 1,
			Salon_closing_hours: 1,
			_id: 0
		});

		//	const hours = moment("00", "hh").format("LT");
		//const hours = moment("12:00 AM", ["h:mm A"]).format("HH:mm");// to convert 12 hours into 24
		// console.log("hours in format", hours);
		console.log("salon opening and closing", Salon_timings);
		// const opening = moment(Salon_timings.Salon_opening_hours, "hh:mm").format(
		// 	"LT"
		// );
		// const closing = moment(Salon_timings.Salon_closing_hours, "hh:mm").format(
		// 	"LT"
		// );
		// let format = "hh:mm A";
		// let start_time = moment(req.body.stating_time, format);
		//const start_time = moment(req.body.stating_time, "hh:mm").format("LT");
		// console.log("start time is ", start_time);

		// let starttime2 = moment(req.body.stating_time, format);
		// let endtime = starttime2.add(100, "minutes");
		// let onlytime = moment(endtime, "hh:mm").format("LT");
		// //	let onlytime1 = moment(onlytime, "hh:mm").format("HH:mm");

		//	let starttime = moment(req.body.stating_time, ["h:mm A"]).format("HH:mm");

		// console.log("hours are ", opening, closing);
		// let salon_range = moment.range(opening, closing);
		// let appointment_range = moment.range(start_time, onlytime);
		// console.log("salon range", salon_range);
		// console.log("appointment range", appointment_range);

		// if (salon_range.contains(appointment_range)) {
		// 	console.log("it contains");
		// } else {
		// 	console.log("it does not contain");
		// }
		// return res.status(200).send("its ok");

		// if (start_time.isBetween(opening, closing)) {
		// 	console.log("is between");
		// } else {
		// 	console.log("is not between");
		// }

		//to convert 24 hours into 12 hours AM

		// let request_boking_time = moment(req.body.stating_time).format("HH:mm A");

		// if (req.body.stating_time < opening) {
		// 	console.log("yes it is less");
		// }
		//console.log("after conversion", opening, closing, request_boking_time);

		// const twelevehoursformt = moment(Salon_timings.Salon_closing_hours).format(
		// 	"h:mm A "
		// );
		//console.log("hell", twelevehoursformt);
		const format = "hh:mm A";

		let starttime = moment(req.body.stating_time, ["h:mm A"]).format("HH:mm");
		let starttime2 = moment(req.body.stating_time, format);
		//let starttime2 = moment(req.body.stating_time).format("");

		let endtime = starttime2.add(Salon_id.service_time, "minutes");
		let final_form_of_end_time = moment(endtime).format("HH:mm");

		//endtime = moment(endtime).format("HH:mm A");
		//console.log("start time is ", starttime);
		//console.log("end time is ", final_form_of_end_time);
		// console.log(
		// 	"Salon timings ",
		// 	Salon_timings.Salon_opening_hours,
		// 	Salon_timings.Salon_closing_hours
		// );

		if (starttime < Salon_timings.Salon_opening_hours) {
			return res.status(400).send("this is due to opening hours");
		}

		if (final_form_of_end_time > Salon_timings.Salon_closing_hours) {
			return res.status(400).send("due to closing hours excedd");
		}

		const appointment_date = await ServiceAppointmentTable.find({
			booking_date: req.body.booking_date
		}).select({ stating_time: 1, ending_time: 1, _id: 0 });

		console.log("appointment data is", appointment_date);
		if (appointment_date.length == 0) {
			const request_boking_time = moment(req.body.stating_time, format);
			const request_boking_time1 = moment(req.body.stating_time, format);
			const req_end_time = request_boking_time1.add(
				Salon_id.service_time,
				"minutes"
			);

			const appointment = new ServiceAppointmentTable({
				customer_id: decode.id,
				service_id: req.body.serviceid,
				Salon_id: Salon_id.Salon_id,
				booking_date: req.body.booking_date,
				stating_time: request_boking_time,
				ending_time: req_end_time
			});

			try {
				const result = await appointment.save();
				return res.status(200).send(result);
			} catch (error) {
				return res.status(400).send(error.message);
			}
		} else {
			try {
				var flag = false;
				//	let format = "hh:mm A";
				const request_boking_time = moment(req.body.stating_time, format);
				const request_boking_time1 = moment(req.body.stating_time, format);
				const req_end_time = request_boking_time1.add(
					Salon_id.service_time,
					"minutes"
				);
				const req_time_range = moment.range(request_boking_time, req_end_time);
				console.log("req time range ", req_time_range);
				appointment_date.map(item => {
					let start_time = moment(item.stating_time);
					let end_time = moment(item.ending_time);
					let range = moment.range(start_time, end_time);
					console.log("already booked service range", range);
					if (range.contains(req_time_range)) {
						//	return res.status(200).send("it does contains");ri
						flag = true;
					}
					if (range.contains(request_boking_time)) {
						//	return res.status(200).send("it does contains");ri
						flag = true;
					}
					if (range.contains(req_end_time)) {
						//	return res.status(200).send("it does contains");ri
						flag = true;
					}
				});

				if (flag === true) {
					return res.status(400).send("Time out exception");
				} else {
					let format = "hh:mm A";
					let start_time = moment(req.body.stating_time, format);
					let start_time2 = moment(req.body.stating_time, format);
					let end_time = start_time2.add(Salon_id.service_time, "minutes");
					const appointment = new ServiceAppointmentTable({
						// customer_id: decode.id,
						// service_id: req.body.serviceid,
						// Salon_id: Salon_id,
						booking_date: req.body.booking_date,
						stating_time: start_time,
						ending_time: end_time
					});
					try {
						const result = await appointment.save();
						return res.status(200).send(result);
					} catch (error) {
						return res.status(400).send(error.message);
					}

					//return res.status(200).send("it does not contain");
				}
			} catch (exc) {
				return res.status(400).send("bad request error");
			}
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

// let format = "hh:mm A";
// let start_time1 = moment(req.body.stating_time, format);
// let start_time3 = moment(req.body.stating_time, format);
// let end_time1 = start_time3.add(5, "minutes");
// let start_time = moment(req.body.stating_time, format);
// let start_time2 = moment(req.body.stating_time, format);
// let end_time = start_time2.add(50, "minutes");
// let range = moment.range(start_time, end_time);
// let range1 = moment.range(start_time1, end_time1);
// if (range.contains(range1)) {
// 	return res.status(200).send(range1);
// } else {
// 	return res.status(200).send("it does'nt contains");
// }

//	console.log("The date is in the form ", req.body.booking_date);
//	console.log("The time is in the form ", req.body.stating_time);
/*let format = "HH:mm A";
	let start_time = moment(req.body.stating_time, format);
	let start_time2 = moment(req.body.stating_time, format);
	let end_time = start_time2.add(50, "minutes");
	const appointment = new ServiceAppointmentTable({
		// customer_id: decode.id,
		// service_id: req.body.serviceid,
		// Salon_id: Salon_id,
		booking_date: req.body.booking_date,
		stating_time: start_time,
		ending_time: end_time
	});

	try {
		const result = await appointment.save();
		return res.status(200).send(result);
	} catch (error) {
		return res.status(400).send(error.message);
	}*/
// console.log("The date is in the form ", req.body.booking_date);
// console.log("The starting time is in the form ", start_time);
// console.log("The endingtime is in the form ", end_time);

///var end_time = moment(end_time, format);
// const Salon_id = await SalonServicesTable.findOne({
// 	_id: req.body.service_id
// }).select({ Salon_id: 1, _id: 0 });
//console.log("salon id ", Salon_id);
//return res.status(200).send(req.body);

/*ServiceAppointmentRouter.post("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const Salon_id = SalonServicesTable.findOne({
				service_id: req.body.service_id
			});
			const appointment = new ServiceAppointmentTable({
				customer_id: decode.id,
				service_id: req.body.serviceid,
				Salon_id: Salon_id,
				booking_date: req.body.date,
				stating_time: req.body.stating_time,
				ending_time: req.body.ending_time
			});
			try {
				const result = await appointment.save();
				return res.status(200).send(result);
			} catch (error) {
				return res.status(400).send(error.message);
			}
		}
	} catch (exc) {
		res.status(400).send("Invalid token");
	}
});
*/
module.exports.ServiceAppointmentRouter = ServiceAppointmentRouter;

module.exports.ServiceAppointmentTable = ServiceAppointmentTable;
