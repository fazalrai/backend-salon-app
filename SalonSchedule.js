const monogoes = require("mongoose");
const express = require("express");
//var moment = require("moment");
const Moment = require("moment");
const MomentRange = require("moment-range");

const moment = MomentRange.extendMoment(Moment);
const jwt = require("jsonwebtoken");
const { ServiceAppointmentTable } = require("./ServiceAppointment");
const Salon_Schedule_router = express.Router();

Salon_Schedule_router.get("/:id", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const date1 = req.params.id;

			const date = moment(date1).format("YYYY-MM-DD");
			console.log("date is", date);
			const result = await ServiceAppointmentTable.find({
				booking_date: date,
				Salon_id: decode.id,
			});
			console.log("result is ", result);
			if (result.length == 0) {
				return res.status(200).send("No appointment's today");
			} else {
				console.log("result is", result);
				return res.status(200).send(result);
			}
		}
	} catch (exc) {
		res.status(400).send(exc.message);
	}
});

module.exports.Salon_Schedule_router = Salon_Schedule_router;
