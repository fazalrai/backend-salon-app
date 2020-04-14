const monogoes = require("mongoose");
const express = require("express");
const multer = require("multer");
const bucket = require("./index");
const uploadImage = require("./image_upload_helper");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public");
	},
	filename: function (req, file, cb) {
		cb(null, new Date().now + file.originalname);
	},
});
const filefilter = (req, file, cb) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(null, false);
	}
};
const upload = multer(
	{ dest: "./public" },
	{ limits: { fileSize: 1024 * 1024 * 7 } }
);
const jwt = require("jsonwebtoken");
const { SalonTable } = require("./Salon_signup");
const recomended_service_router = express.Router();
const recomended_service_schema = new monogoes.Schema({
	serviceName: { type: String, required: true, minlength: 3, maxlength: 20 },
	servicePrice: { type: Number, required: true, minlength: 1 },
	serviceDescription: { type: String, required: true, minlength: 10 },
	image_url: { type: String, required: true },
	service_category: { type: String, required: true },
	service_time: { type: Number, required: false },
});
const recomended_service_table = monogoes.model(
	"recomended_service_table",
	recomended_service_schema
);
// To get salon service of particular salon
recomended_service_router.get(
	"/",

	async (req, res) => {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		try {
			const decode = jwt.verify(token, "login_jwt_privatekey");

			if (decode) {
				const allservices = await recomended_service_table.find().sort("name");
				return res.status(200).send(allservices);
			}
		} catch (exc) {
			res.status(400).send("Invalid token");
		}
	}
);

recomended_service_router.get("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				const singleservice = await recomended_service_table.findById(
					req.params.id
				);
				if (singleservice) return res.status(200).send(singleservice);
				return res.status(200).send("No service to display");
			} catch (exc) {
				return res.status(400).send("Invalid id");
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid token");
	}
});

recomended_service_router.delete("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				let result = await recomended_service_table.findById(req.params.id);
				console.log(result);
				const r1 = await result.remove();
				return res.status(200).send("Service deleted successfuuly");
			} catch (exc) {
				return res.status(400).send("invalid id");
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});

recomended_service_router.put("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				var user2 = await recomended_service_table.findById(req.params.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}
			const myFile = req.file;
			const imageUrl = await uploadImage.uploadImage(myFile);

			(user2.serviceName = req.body.servicename),
				(user2.servicePrice = req.body.price),
				(user2.serviceDescription = req.body.description),
				(user2.image_url = imageUrl),
				(user2.service_category = req.body.service_category)(
					(user2.service_time = req.body.service_time)
				);

			try {
				const result = await user2.save();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(ex.message);
			}
		}
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
});
//upload.single("image"), function to be called if u want to store images locaaly
recomended_service_router.post("/", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				const myFile = req.file;
				const imageUrl = await uploadImage.uploadImage(myFile);

				const newService = new recomended_service_table({
					serviceName: req.body.servicename,
					servicePrice: req.body.price,
					serviceDescription: req.body.description,
					image_url: imageUrl,
					service_category: req.body.service_category,
					service_time: req.body.service_time,
				});
				const result = await newService.save();
				return res.status(200).send(result);
			} catch (error) {
				return res.status(400).send(error.message);
			}
		}
	} catch (error) {
		return res.status(400).send(error.message);
	}
});

module.exports.recomended_service_table = recomended_service_table;
module.exports.recomended_service_router = recomended_service_router;
