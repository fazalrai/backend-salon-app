const monogoes = require("mongoose");
const express = require("express");
const multer = require("multer");
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "./public");
	},
	filename: function(req, file, cb) {
		cb(null, new Date().now + file.originalname);
	}
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
const saloonServicesRouter = express.Router();
const saloonServicesSchema = new monogoes.Schema({
	serviceName: { type: String, required: true, minlength: 3, maxlength: 20 },
	servicePrice: { type: Number, required: true, minlength: 1 },
	serviceDescription: { type: String, required: true, minlength: 10 },
	image: { type: String, required: true },
	service_category: { type: String, required: true },
	Salon_id: { type: String, required: true },
	service_time: { type: Number, required: true }
	//	ServiceAvgRating: { type: Number }
});
const SalonServicesTable = monogoes.model(
	"SalonServicesTable",
	saloonServicesSchema
);
// To get salon service of particular salon
saloonServicesRouter.get(
	"/",

	async (req, res) => {
		// const allservices = await SalonServicesTable.find();
		// res.status(200).send(allservices);
		//	console.log("hello");

		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		try {
			const decode = jwt.verify(token, "login_jwt_privatekey");

			if (decode) {
				const allservices = await SalonServicesTable.find({
					Salon_id: decode.id
				}).sort("name");
				res.status(200).send(allservices);
			}
		} catch (exc) {
			res.status(400).send("Invalid token");
		}
	}
);
saloonServicesRouter.get(
	"/:id",

	async (req, res) => {
		// const allservices = await SalonServicesTable.find();
		// res.status(200).send(allservices);
		//	console.log("hello");

		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		try {
			const decode = jwt.verify(token, "login_jwt_privatekey");

			if (decode) {
				const allservices = await SalonServicesTable.find({
					Salon_id: req.params.id
				}).sort("name");
				res.status(200).send(allservices);
			}
		} catch (exc) {
			res.status(400).send("Invalid token");
		}
	}
);

saloonServicesRouter.get("/Filter_by_Price", async (req, res) => {
	// const token = req.header("x-auth-token");
	// if (!token) return res.status(401).send("Access denied ,No token provided");
	// try {
	// 	const decode = jwt.verify(token, "login_jwt_privatekey");
	// 	if (decode) {
	// 	// 		const allservices = await SalonServicesTable.find().sort({
	// 				servicePrice: 1
	// 			});
	// 			res.status(200).send(allservices);
	// 		}
	// 	} catch (exc) {
	// 		res.status(400).send("Invalid token");
	// 	}
	// });
});
saloonServicesRouter.get("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				const singleservice = await SalonServicesTable.findById(req.params.id);
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

saloonServicesRouter.delete("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				let result = await SalonServicesTable.findById(req.params.id);
				console.log(result);
				const r1 = result.remove();
				return res.status(200).send("Service deleted successfuuly");
			} catch (exc) {
				return res.status(400).send("invalid id");
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});

/*Userrouter.del('/:id', async (req,res)=>{
Users.deleteOne(req.params.id)
console.log(req.send("successfuly deleted"));
})*/

saloonServicesRouter.put("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				var user2 = await SalonServicesTable.findById(req.params.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}
			(user2.serviceName = req.body.servicename),
				(user2.servicePrice = req.body.price),
				(user2.serviceDescription = req.body.description),
				(user2.image = req.file.path),
				(user2.service_category = req.body.service_category);
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
	//	(user2.phoneNumber = req.body.phnnbr);
});

saloonServicesRouter.post("/", upload.single("image"), async (req, res) => {
	try {
		//console.log("hello");
		//	console.log("eader is ", req.header("x-auth-token"));
		//	console.log(req.headers);
		//	console.log(req.headers("x-auth-token"));
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		try {
			const decode = jwt.verify(token, "login_jwt_privatekey");
			if (decode) {
				try {
					const newService = new SalonServicesTable({
						serviceName: req.body.servicename,
						servicePrice: req.body.price,
						serviceDescription: req.body.description,
						image: req.file.path,
						service_category: req.body.service_category,
						Salon_id: decode.id,
						service_time: req.body.service_time
					});

					try {
						//	console.log(newService);
						const result = await newService.save();
						console.log(result);
						return res.status(200).send(result);
						//	const Salon = await SalonTable.find({ _id: decode.id });
						// const addservice = await SalonTable.update(
						// 	{
						// 		_id: decode.id
						// 	},
						// 	{ $push: { ListOfSalonServices: result._id } }
						// );
						//	return res.status(200).send(result);
					} catch (ex) {
						return res.status(400).send(ex.message);
					}
				} catch (ex) {
					return res.status(400).send(ex.message);
				}
			}
		} catch (ex) {
			return res.status(400).send("Invalid token");
		}
	} catch (error) {
		return res.status(400).send(error.message);
		//console.log(error.message);
	}
});
// saloonServicesRouter.post("/", async (req, res) => {
// 	return res.send("hello world");
// });
module.exports.SalonServicesTable = SalonServicesTable;
module.exports.saloonServicesRouter = saloonServicesRouter;
//module.exports.servce = servce;
