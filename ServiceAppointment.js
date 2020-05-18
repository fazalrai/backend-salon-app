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
		type: String,
		//required: true
	},
	service_id: {
		type: String,
		//required: true
	},
	service_status: {
		type: Boolean,
		required: true,
	},
	booking_date: {
		type: Date,
		//	required: true
	},
	stating_time: {
		type: String,
		//	required: true
	},
	ending_time: {
		type: String,
		//	required: true
	},
	Salon_id: {
		type: String,
		//	required: true
	},
});
const ServiceAppointmentTable = monogoes.model(
	"ServiceAppointmentTable",
	ServiceAppointmentSchema
);

ServiceAppointmentRouter.post("/:id", async (req, res, next) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			console.log("hello", req.params.id);
			if (req.body.booking_date < req.body.current_date) {
				return res.status(400).send("bad request error");
			}

			const Salon_id = await SalonServicesTable.findOne({
				_id: req.params.id,
				Salon_id: req.body.salon_id,
			}).select({ Salon_id: 1, service_time: 1, _id: 0 });

			const Salon_timings = await SalonTable.findOne({
				_id: Salon_id.Salon_id,
			}).select({
				Salon_opening_hours: 1,
				Salon_closing_hours: 1,
				_id: 0,
			});

			console.log("salon opening and closing", Salon_timings);

			const format = "hh:mm A";

			let starttime = moment(req.body.stating_time, ["h:mm A"]).format("HH:mm");
			let starttime2 = moment(req.body.stating_time, format);

			let endtime = starttime2.add(Salon_id.service_time, "minutes");
			let final_form_of_end_time = moment(endtime).format("HH:mm");

			if (starttime < Salon_timings.Salon_opening_hours) {
				return res.status(400).send("this is due to opening hours");
			}

			if (final_form_of_end_time > Salon_timings.Salon_closing_hours) {
				return res.status(400).send("due to closing hours excedd");
			}

			const appointment_date = await ServiceAppointmentTable.find({
				booking_date: req.body.booking_date,
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
					service_id: req.params.id,
					Salon_id: Salon_id.Salon_id,
					booking_date: req.body.booking_date,
					stating_time: request_boking_time,
					ending_time: req_end_time,
					service_status: false,
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
					const request_boking_time = moment(req.body.stating_time, format);
					const request_boking_time1 = moment(req.body.stating_time, format);
					const req_end_time = request_boking_time1.add(
						Salon_id.service_time,
						"minutes"
					);
					const req_time_range = moment.range(
						request_boking_time,
						req_end_time
					);
					console.log("req time range ", req_time_range);
					appointment_date.map((item) => {
						let start_time = moment(item.stating_time);
						let end_time = moment(item.ending_time);
						let range = moment.range(start_time, end_time);
						console.log("already booked service range", range);
						if (range.contains(req_time_range)) {
							flag = true;
						}
						if (range.contains(request_boking_time)) {
							flag = true;
						}
						if (range.contains(req_end_time)) {
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
							customer_id: decode.id,
							service_id: req.params.id,
							Salon_id: Salon_id.Salon_id,
							booking_date: req.body.booking_date,
							stating_time: start_time,
							ending_time: end_time,
							service_status: false,
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
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

ServiceAppointmentRouter.delete("/:id", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");

		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const service = await ServiceAppointmentTable.findOne({
				_id: req.params.id,
			});
			console.log("service is ", service);
			const result = await service.remove();
			return res.status(200).send("appointment cancelled successfuuly");
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});
ServiceAppointmentRouter.post("/service/status/:id", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");

		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const service = await ServiceAppointmentTable.findOne({
				_id: req.params.id,
			});
			service.service_status = req.body.service_status;
			console.log("service is ", service);
			const result = await service.save();
			return res.status(200).send("service status updated successfuuly");
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
