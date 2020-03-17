const monogoes = require("mongoose");
const express = require("express");
const SalonRouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SalonSchema = new monogoes.Schema({
	Salon_owner_firstName: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 20
	},
	Salon_owner_lastName: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 20
	},
	SalonOwnerEmail: { type: String, required: true, minlength: 7 },
	password: { type: String, required: true, minlength: 8, maxlength: 70 },
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
	Salon_opening_hours: {
		type: String,
		required: true
	},
	Salon_closing_hours: {
		type: String,
		required: true
	},
	Account_verfied: {
		type: Boolean,
		required: true
	}
	//ListOfSalonServices: [String]
});
const SalonTable = monogoes.model("SalonOwner", SalonSchema);

SalonRouter.post("/", async (req, res) => {
	console.log(req.body);
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
			Salon_owner_firstName: req.body.Salon_owner_firstName,
			Salon_owner_lastName: req.body.Salon_owner_lastName,
			SalonOwnerEmail: req.body.email,
			password: req.body.password,
			SalonOwnerphoneNumber: req.body.phoneNumber,
			SalonOwnerCnic: req.body.cnic,
			SalonName: req.body.salonname,
			Salon_opening_hours: req.body.Salon_opening_hours,
			Salon_closing_hours: req.body.Salon_closing_hours,
			Account_verfied: false
		});
		const salt = await bcrypt.genSalt(10);
		newSalon.password = await bcrypt.hash(newSalon.password, salt);
		try {
			await newSalon
				.save()
				.then(result => {
					const token = jwt.sign(
						{ newSalon_account: true, id: result._id },
						"login_jwt_privatekey"
					);
					return (
						res
							//	.header("x-auth-token", token)
							.status(200)
							.send("Request submitted sucessfully wait for verification")
					);
				})

				.catch(error => {
					return res.status(400).send(error.message);
				});
		} catch (error) {
			return res.status(400).send(error.message);
		}
	} catch (error) {
		return res.status(400).send(error.message);
	}
});

SalonRouter.put("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				var user2 = await SalonTable.findById(decode.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}

			const user = await SalonTable.findOne({
				SalonOwnerEmail: req.body.email,
				_id: { $ne: decode.id }
			});
			if (user) return res.status(400).send("Email already exist");
			let user1 = await SalonTable.findOne({
				SalonOwnerphoneNumber: req.body.phoneNumber,
				_id: { $ne: decode.id }
			});
			if (user1) return res.status(400).send("Phone number already exist");

			(user2.Salon_owner_firstName = req.body.name),
				(user2.SalonOwnerEmail = req.body.email),
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

SalonRouter.put("/change/password", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				var user2 = await SalonTable.findById(decode.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}
			if (user2.password === req.body.oldpassword) {
				user2.password = req.body.newpassword;
				try {
					const result = await user2.save();
					return res.status(200).send(result);
				} catch (exc) {
					return res.status(400).send(ex.message);
				}
			} else {
				return res.status(400).send("Old Password didnot matched");
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid token");
	}
});

SalonRouter.post("/forgot/password", async (req, res) => {
	name = SalonTable.findOne({ SalonOwnerphoneNumber: req.body.phnnbr });
	if (name) {
		const customerId = "9F66B2BC-623D-4351-8687-884B5A723C92";
		const apiKey =
			"xNJ8n/FtprpI6XcPcz/4oWBy3wlaGh9na/4xEMtNlqitYaAKnEf5JSqbCh6oPaBE0yaxOOAKX6bmPg6cqaMeaQ==";
		const rest_endpoint = "https://rest-api.telesign.com";
		const timeout = 10 * 1000; // 10 secs

		const client = new TeleSignSDK(
			customerId,
			apiKey,
			rest_endpoint,
			timeout // optional
			// userAgent
		);

		const phoneNumber = req.body.phnnbr; //req.body.phnnbr;
		digit = Math.floor(random(1000, 10000));
		const messageType = "ARN";

		//console.log("## MessagingClient.message ##");

		function messageCallback(error, responseBody) {
			if (error === null) {
				//console.log(
				//	`Messaging response for messaging phone number: ${phoneNumber}` +
				//		` => code: ${responseBody["status"]["code"]}` +
				//		`, description: ${responseBody["status"]["description"]}`
				//);
				return res
					.status(200)
					.send("enter the verfication code send to your number");
			} else {
				return res.status(400).send(error);
				//console.error("Unable to send message. " + error);
			}
		}
		client.sms.message(messageCallback, phoneNumber, message, messageType);
	} else {
		return res.status(400).send("Invalid phnnbr");
	}
});
SalonRouter.put("/add_new_password", async (req, res) => {
	name.password = req.body.password;
	try {
		const result = await name.save();
		return res.status(200).send(result);
	} catch (exc) {
		return res.status(400).send(ex.message);
	}
});

function random(low, high) {
	return Math.random() * (high - low) + low;
}

SalonRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const salon = await SalonTable.find({ Account_verfied: true }).select({
				SalonName: 1,
				Salon_opening_hours: 1,
				Salon_closing_hours: 1,
				_id: 1
			});
			return res.status(200).send(salon);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});
module.exports.SalonRouter = SalonRouter;
module.exports.SalonTable = SalonTable;
