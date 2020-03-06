const monogoes = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const { SalonServicesTable } = require("./saloonServices");
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

ServiceAppointmentRouter.post("/", async (req, res) => {
	console.log("The date is in the form ", req.body.booking_date);
	console.log("The time is in the form ", req.body.stating_time);

	// const Salon_id = await SalonServicesTable.findOne({
	// 	_id: req.body.service_id
	// }).select({ Salon_id: 1, _id: 0 });
	//console.log("salon id ", Salon_id);
	return res.status(200).send(req.body);
});

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
