const monogoes = require("mongoose");
const express = require("express");
const multer = require("multer");
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
//const { SalonTable } = require("./Salon_signup");
const super_admin_service_router = express.Router();
const super_admin_service_schema = new monogoes.Schema({
	serviceName: { type: String, required: true, minlength: 3, maxlength: 20 },
	servicePrice: { type: Number, required: true, minlength: 1 },
	serviceDescription: { type: String, required: true, minlength: 10 },
	image: { type: String, required: true },
	service_category: { type: String, required: true },
	//Salon_id: { type: String, required: true },
	service_time: { type: Number, required: true },
	//	ServiceAvgRating: { type: Number }
});
const super_admin_service_table = monogoes.model(
	"super_admin_service_table",
	super_admin_service_schema
);
// To get salon service of particular salon
super_admin_service_router.get(
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
				const allservices = await super_admin_service_table.find().sort("name");
				res.status(200).send(allservices);
			}
		} catch (exc) {
			res.status(400).send("Invalid token");
		}
	}
);

super_admin_service_router.get("/Filter_by_Price", async (req, res) => {
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
super_admin_service_router.get("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				const singleservice = await super_admin_service_table.findById(
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

super_admin_service_router.delete("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				let result = await super_admin_service_table.findById(req.params.id);
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

super_admin_service_router.put("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				var user2 = await super_admin_service_table.findById(req.params.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}
			const myFile = req.file;
			const imageUrl = await uploadImage.uploadImage(myFile);

			(user2.serviceName = req.body.servicename),
				(user2.servicePrice = req.body.price),
				(user2.serviceDescription = req.body.description),
				(user2.image = imageUrl),
				(user2.service_category = req.body.service_category);
			try {
				const result = await user2.save();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(exc.message);
			}
		}
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
	//	(user2.phoneNumber = req.body.phnnbr);
});

super_admin_service_router.post(
	"/",
	upload.single("image"),
	async (req, res) => {
		try {
			//console.log("hello");
			//	console.log("eader is ", req.header("x-auth-token"));
			//	console.log(req.headers);
			//	console.log(req.headers("x-auth-token"));
			const token = req.header("x-auth-token");
			if (!token)
				return res.status(401).send("Access denied ,No token provided");
			try {
				const decode = jwt.verify(token, "login_jwt_privatekey");
				if (decode) {
					try {
						const newService = new super_admin_service_table({
							serviceName: req.body.servicename,
							servicePrice: req.body.price,
							serviceDescription: req.body.description,
							image: req.file.path,
							service_category: req.body.service_category,
							service_time: req.body.service_time,
						});

						try {
							//	console.log(newService);
							const result = await newService.save();
							//	console.log(result);
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
	}
);
// saloonServicesRouter.post("/", async (req, res) => {
// 	return res.send("hello world");
// });
module.exports.super_admin_service_table = super_admin_service_table;
module.exports.saloonServicesRouter = saloonServicesRouter;
//module.exports.servce = servce;
