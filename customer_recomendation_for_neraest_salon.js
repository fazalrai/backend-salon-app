const monogoes = require("mongoose");
const express = require("express");
const Moment = require("moment");
const MomentRange = require("moment-range");

const moment = MomentRange.extendMoment(Moment);
const jwt = require("jsonwebtoken");
const { SalonServicesTable } = require("./saloonServices");
const { SalonTable } = require("./Salon_signup");
const { ServiceAppointmentTable } = require("./ServiceAppointment");
const customer_recomendation_for_nearest_salon_router = express.Router();
const customer_recomendation_for_nearest_salon_schema = new monogoes.Schema({
	customer_id: { type: String, required: true, minlength: 3, maxlength: 20 },
});
const customer_recomendation_for_nearest_salon_table = monogoes.model(
	"customer_recomendation_for_nearest_salon_table",
	customer_recomendation_for_nearest_salon_schema
);
customer_recomendation_for_nearest_salon_router.post(
	"/:id",
	async (req, res) => {
		try {
			const date1 = req.params.id;

			const date = moment(date1).format("YYYY-MM-DD");
			console.log("date is", date);
			const result = await ServiceAppointmentTable.find({
				booking_date: date,
				Salon_id: decode._id,
			});
			const customerid = new monogoes({
				customer_id: result.customer_id,
			});
			const save = await customerid.save();
			console.log("result is ", result);
			if (result.length == 0) {
				return res.status(200).send("No appointment's today");
			} else {
				console.log("result is", result);
				return res.status(200).send(save);
			}
		} catch (exc) {
			res.status(400).send(exc.message);
		}
	}
);
module.exports.customer_recomendation_for_nearest_salon_router = customer_recomendation_for_nearest_salon_router;
