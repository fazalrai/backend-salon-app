const monogoes = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const { SalonTable } = require("./Salon_signup");
const saloonServicesRouter = express.Router();
const saloonServicesSchema = new monogoes.Schema({
	serviceName: { type: String, required: true, minlength: 3, maxlength: 20 },
	servicePrice: { type: Number, required: true, minlength: 1 },
	serviceDescription: { type: String, required: true, minlength: 10 }
	//	SericeImageAddress: { type: String },
	//	ServiceAvgRating: { type: Number }
});
const SalonServicesTable = monogoes.model(
	"SalonServicesTable",
	saloonServicesSchema
);
// To get salon service of particular salon
saloonServicesRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			const allservices = await SalonServicesTable.find().sort("name");
			res.status(200).send(allservices);
		}
	} catch (exc) {
		res.status(400).send("Invalid token");
	}
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
				return res.status(200).send("User deleted successfuuly");
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
				(user2.serviceDescription = req.body.description);
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

saloonServicesRouter.post("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				const newService = new SalonServicesTable({
					serviceName: req.body.servicename,
					servicePrice: req.body.price,
					serviceDescription: req.body.description
					//ServiceAvgRating: req.body.rating
				});

				try {
					const result = await newService.save();
					const Salon = await SalonTable.find({ _id: decode.id });
					const addservice = SalonTable.update({
						$push: { ListOfSalonServices: newService._id }
					});
					return res.status(200).send(result);
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
});
module.exports.saloonServicesRouter = saloonServicesRouter;
//module.exports.servce = servce;
