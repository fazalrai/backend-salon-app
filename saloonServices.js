const monogoes = require("mongoose");
const express = require("express");
const multer = require("multer");
const bucket = require("./index");
const uploadImage = require("./image_upload_helper");

// const multerMid = multer({
// 	storage: multer.memoryStorage(),
// 	limits: {
// 		// no larger than 5mb.
// 		fileSize: 5 * 1024 * 1024
// 	}
// });
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
const saloonServicesRouter = express.Router();
const saloonServicesSchema = new monogoes.Schema({
	serviceName: { type: String, required: true, minlength: 3, maxlength: 20 },
	servicePrice: { type: Number, required: true, minlength: 1 },
	serviceDescription: { type: String, required: true, minlength: 10 },
	image_url: { type: String, required: true },
	service_category: { type: String, required: true },
	Salon_id: { type: String, required: true },
	service_time: { type: Number, required: true },
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
					Salon_id: decode.id,
				}).sort("service_category");
				return res.status(200).send(allservices);
			}
		} catch (exc) {
			res.status(400).send("Invalid token");
		}
	}
);
saloonServicesRouter.get(
	"/:Salon_id",

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
					Salon_id: req.params.Salon_id,
				}).sort("");
				res.status(200).send(allservices);
			}
		} catch (exc) {
			res.status(400).send("Invalid token");
		}
	}
);
saloonServicesRouter.get(
	"/Salon/:Service_id",

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
					_id: req.params.Service_id,
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
	console.log("hello");
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			const user2 = await SalonServicesTable.findById(req.params.id);
			if (!user2) return res.status(400).send("invalid id");
			// const myFile = req.file;
			// const imageUrl = await uploadImage.uploadImage(myFile);
			(user2.serviceName = req.body.servicename),
				(user2.servicePrice = req.body.price),
				(user2.serviceDescription = req.body.description),
				(user2.image_url = req.body.image),
				(user2.service_category = req.body.service_category),
				(user2.service_time = req.body.service_time);

			const result = await user2.save();
			return res.status(200).send(result);
		}
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
	//	(user2.phoneNumber = req.body.phnnbr);
});
//upload.single("image"), function to be called if u want to store images locaaly
saloonServicesRouter.post("/recomended/service", async (req, res) => {
	console.log("hello", req.body);
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				const newService = new SalonServicesTable({
					serviceName: req.body.servicename,
					servicePrice: req.body.price,
					serviceDescription: req.body.description,
					image_url: req.body.image,
					service_category: req.body.service_category,
					Salon_id: decode.id,
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
saloonServicesRouter.post("/", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				const myFile = req.file;
				const imageUrl = await uploadImage.uploadImage(myFile);

				const newService = new SalonServicesTable({
					serviceName: req.body.servicename,
					servicePrice: req.body.price,
					serviceDescription: req.body.description,
					image_url: imageUrl,
					service_category: req.body.service_category,
					Salon_id: decode.id,
					service_time: req.body.service_time,
				});
				const result = await newService.save();
				return res.status(200).send(result);
			} catch (error) {
				return res.status(400).send(error.message);
			}

			// const publicUrl = "";
			// blobStream.on("finish", () => {
			// 	publicUrl = format(
			// 		`https://storage.googleapis.com/${bucket.name}/${blob.name}`
			// 	);
			// });
			// console.log("public url is", publicUrl);
			// // const imgurl = await bucket.bucket.upload(file, {
			// 	resumable: true
			// });
			// const publicUrl = format(
			// 	`https://storage.googleapis.com/${bucket.bucket.name}/${blob.name}`
			// );

			//	const public_url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

			//	console.log("image url is", publicUrl);

			//	console.log(newService);
			//	console.log(result);
			//	const Salon = await SalonTable.find({ _id: decode.id });
			// const addservice = await SalonTable.update(
			// 	{
			// 		_id: decode.id
			// 	},
			// 	{ $push: { ListOfSalonServices: result._id } }
			// );
			//	return res.status(200).send(result);
		}
	} catch (error) {
		return res.status(400).send(error.message);
	}
});

module.exports.SalonServicesTable = SalonServicesTable;
module.exports.saloonServicesRouter = saloonServicesRouter;
//module.exports.servce = servce;
