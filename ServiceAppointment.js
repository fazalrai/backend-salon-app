const monogoes = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const ServiceAppointmentRouter = express.Router();

const ServiceAppointmentSchema = new monogoes.Schema({
	customer_id: {
		type: String,
		required: true
	},
	service_id: {
		type: String,
		required: true
	},
	service_status: {
		type: String,
		required: true,
		enum: ["availed", "onqueue"]
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
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			const appointment = new ServiceAppointmentTable({
				customer_id: req.body.customerid,
				service_id: req.body.serviceid,
				service_status: req.body.servicestatus
			});
			try {
				const result = await appointment.save();
				return res.status(200).send(result);
			} catch (error) {
				return res.status(400).send(result);
			}
		}
	} catch (exc) {
		res.status(400).send("Invalid token");
	}
});

module.exports.ServiceAppointmentRouter = ServiceAppointmentRouter;

module.exports.ServiceAppointmentTable = ServiceAppointmentTable;
