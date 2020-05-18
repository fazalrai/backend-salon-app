const mongoose = require("mongoose");
const joi = require("joi");
const Reviews_router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SalonServicesTable } = require("./saloonServices");

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
	const service = await SalonServicesTable.findById(req.params.id);
	const rating_obj = await Reviews.findOne({
		service_id: req.params.id,
	}).select({
		count: 1,
		rating: 1,
		_id: 0,
	});
	let old_rating = rating_obj.rating;
	old_rating = old_rating * rating_obj.count;
	const new_rating = old_rating + req.body.rating / rating_obj.count + 1;
	service.ServiceAvgRating = new_rating;
	try {
		const new_rating = new Reviews({
			service_id: req.params.id,
			user_id: decode.id,
			rating: new_rating,
			count: rating_obj.count + 1,
		});

		const result = await new_rating.save();
		return res.status(200).send(result);
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
	//const service = await SalonServicesTable.findById(req.params.id);
	//const rating = service.ServiceAvgRating;
});
module.exports.Reviews_router = Reviews_router;
