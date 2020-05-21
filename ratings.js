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
	console.log("hello");

	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");

	const decode = jwt.verify(token, "login_jwt_privatekey");
	if (!decode) return res.status(400).send("invalid token");
	try {
		const appointment = await ServiceAppointmentTable.findById(req.params.id);
		if (!appointment) return res.status(400).send("invalid id");
		const service = await SalonServicesTable.findById(appointment.service_id);
		if (!service) return res.status(400).send("invalid service id");
		const rating_obj = await Reviews.findOne({
			service_id: service._id,
		});
		// }).select({
		// 	count: 1,
		// 	rating: 1,
		// 	_id: 0,
		// });
		//console.log("appointment", service);
		if (!rating_obj) {
			console.log("if called");

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
				//const delete_appointment = await appointment.remove();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(exc.message);
			}
		}
		console.log("rating obj", rating_obj);
		let old_rating = rating_obj.rating;
		//	old_rating = old_rating * rating_obj.count;
		console.log("old rating", old_rating);
		var count = rating_obj.count + 1;
		console.log("old count", count);

		var sum_of_old_and_new_rating = old_rating + req.body.rating;
		console.log("sum", sum_of_old_and_new_rating);

		let new_ratings = (sum_of_old_and_new_rating / count).toFixed(1);
		console.log("new rating", new_ratings);

		service.ServiceAvgRating = new_ratings;

		try {
			(rating_obj.rating = sum_of_old_and_new_rating),
				(rating_obj.service_id = rating_obj.service_id),
				(rating_obj.count = count),
				(rating_obj._id = rating_obj._id);

			const result = await rating_obj.save();

			const update_avg_rating = await service.save();
			//const delete_appointment = await appointment.remove();
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
