const monogoes = require("mongoose");
const express = require("express");
const Moment = require("moment");
const MomentRange = require("moment-range");

const moment = MomentRange.extendMoment(Moment);
const jwt = require("jsonwebtoken");
const { SalonServicesTable } = require("./saloonServices");
const { SalonTable } = require("./Salon_signup");
const salon_off_router = express.Router();

salon_off_router.post("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			if (req.body.availibilty) {
				return res.status(200).send("salon is available");
			}

			const salon = await SalonTable.findOne({ _id: decode._id });
			const salon_appointments = await SalonServicesTable.find({
				Salon_id: salon._id,
			});

			if (salon.salon_appointments.length == 0) {
				return res.status(200).send("no service appointmnet exist");
			}
			const Salon_timings = await SalonTable.findOne({
				_id: req.body.neighbour_salon_timings,
			}).select({
				customer_id: 1,
			});

			return res.status(200).send({});
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});
