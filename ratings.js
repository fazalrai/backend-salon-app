const mongoose = require("mongoose");
const joi = require("joi");
const express = require("express");

const Reviews_router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SalonServicesTable } = require("./saloonServices");
const { ServiceAppointmentTable } = require("./ServiceAppointment");

const reviews = new mongoose.Schema({
	user_id: {
		type: String,
		required: true,
	},
	service_id: {
		type: String,
		required: true,
	},
	rating: {
		type: Number,
		required: true,
	},
	count: {
		type: Number,
		default: 0,
	},
});

const Reviews = mongoose.model("Reviews", reviews);
Reviews_router.post("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");

	const decode = jwt.verify(token, "login_jwt_privatekey");
	if (!decode) return res.status(400).send("invalid token");
	try {
		const appointment = await ServiceAppointmentTable.findById(req.params.id);
		if (!appointment) return res.status(400).send("invalid id");
		const service = await SalonServicesTable.findById(appointment.service_id);
		console.log("service", service);
		if (!service) return res.status(400).send("invalid service id");
		const rating_obj = await Reviews.findOne({
			service_id: service._id,
		}).select({
			count: 1,
			rating: 1,
			_id: 0,
		});
		//console.log("appointment", service);
		if (!rating_obj) {
			try {
				const new_rating = new Reviews({
					service_id: service._id,
					user_id: decode.id,
					rating: req.body.rating,
					count: 1,
				});
				service.ServiceAvgRating = req.body.rating;
				const update_avg_rating = await service.save();
				const result = await new_rating.save();
				const delete_appointment = await appointment.remove();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(exc.message);
			}
		}
		let old_rating = rating_obj.rating;
		old_rating = old_rating * rating_obj.count;
		const new_ratings = old_rating + req.body.rating / rating_obj.count + 1;
		service.ServiceAvgRating = new_ratings;
		try {
			const new_rating = new Reviews({
				service_id: service._id,
				user_id: decode.id,
				rating: rating_obj.rating + req.body.rating,
				count: rating_obj.count + 1,
			});

			const update_avg_rating = await service.save();
			const result = await new_rating.save();
			const delete_appointment = await appointment.remove();
			return res.status(200).send(result);
		} catch (exc) {
			return res.status(400).send(exc.message);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
	//const service = await SalonServicesTable.findById(req.params.id);
	//const rating = service.ServiceAvgRating;
});
module.exports.Reviews_router = Reviews_router;
