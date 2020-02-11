const monogoes = require("mongoose");
const express = require("express");
const SalonRouter = express.Router();
const jwt = require("jsonwebtoken");
const SalonSchema = new monogoes.Schema({
	SalomOwnerName: { type: String, required: true, minlength: 3, maxlength: 20 },
	SalonOwnerEmail: { type: String, required: true, minlength: 7 },
	password: { type: String, required: true, minlength: 8, maxlength: 25 },
	SalonOwnerphoneNumber: {
		type: Number,
		required: true,
		minlength: 10,
		maxlength: 15
	},
	SalonOwnerCnic: {
		type: Number,
		required: true,
		minlength: 10,
		maxlength: 20
	},
	SalonName: { type: String, required: true, minlength: 3 },
	ListOfSalonServices: [String]
});
const SalonTable = monogoes.model("SalonOwner", SalonSchema);

SalonRouter.post("/", async (req, res) => {
	try {
		let salon = await SalonTable.findOne({
			SalonOwnerEmail: req.body.email
		});
		if (salon) return res.status(400).send("Email already exist");
		salon = await SalonTable.findOne({
			SalonOwnerphoneNumber: req.body.phoneNumber
		});
		if (salon) return res.status(400).send("Phone number already exist");
		salon = await SalonTable.findOne({ SalonOwnerCnic: req.body.cnic });
		if (salon) return res.status(400).send("Cnic already exist");
		const newSalon = new SalonTable({
			SalomOwnerName: req.body.name,
			SalonOwnerEmail: req.body.email,
			password: req.body.password,
			SalonOwnerphoneNumber: req.body.phoneNumber,
			SalonOwnerCnic: req.body.cnic,
			SalonName: req.body.salonname
		});

		try {
			await newSalon
				.save()
				.then(result => {
					const token = jwt.sign(
						{ newSalon_account: true, id: result._id },
						"login_jwt_privatekey"
					);
					return res
						.header("x-auth-token", token)
						.status(200)
						.send(result);
				})

				.catch(error => {
					return res.status(400).send(error.message);
				});
			//const token = jwt.sign(
			//	{ newSalon_account: true, id: result._id },
			//	"login_jwt_privatekey"
			//);
			return res
				.status(200)
				.header("x-auth-token", token)
				.send(result);
		} catch (error) {
			return res.status(400).send(error.message);
		}
	} catch (error) {
		return res.status(400).send(error.message);
	}
});

SalonRouter.put("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				var user2 = await SalonTable.findById(req.params.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}

			const user = await SalonTable.findOne({
				SalonOwnerEmail: req.body.email,
				_id: { $ne: req.params.id }
			});
			if (user) return res.status(400).send("Email already exist");
			let user1 = await SalonTable.findOne({
				SalonOwnerphoneNumber: req.body.phoneNumber,
				_id: { $ne: req.params.id }
			});
			if (user1) return res.status(400).send("Phone number already exist");

			(user2.SalomOwnerName = req.body.name),
				(user2.SalonOwnerEmail = req.body.email),
				(user2.password = req.body.password),
				(user2.SalonOwnerphoneNumber = req.body.phoneNumber),
				(user2.SalonOwnerCnic = req.body.cnic),
				(user2.SalonName = req.body.salonname);
			try {
				const result = await user2.save();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(ex.message);
			}
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});
module.exports.SalonRouter = SalonRouter;
module.exports.SalonTable = SalonTable;
