const monogoes = require("mongoose");
const express = require("express");
const SalonRouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { ttl_table } = require("./UsersSignup");
const SalonSchema = new monogoes.Schema({
	Salon_owner_firstName: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 20,
	},
	Salon_owner_lastName: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 20,
	},
	SalonOwnerEmail: { type: String, required: true, minlength: 7 },
	password: { type: String, required: true, minlength: 8, maxlength: 70 },
	SalonOwnerphoneNumber: {
		type: Number,
		required: true,
		minlength: 10,
		maxlength: 15,
	},
	SalonOwnerCnic: {
		type: Number,
		required: true,
		minlength: 10,
		maxlength: 20,
	},
	SalonName: { type: String, required: true, minlength: 3 },
	Salon_opening_hours: {
		type: String,
		required: true,
	},
	Salon_closing_hours: {
		type: String,
		required: true,
	},
	Account_verfied: {
		type: Boolean,
		required: true,
	},
	Latitude: {
		type: Number,
		required: true,
	},
	Longitude: {
		type: Number,
		required: true,
	},
	Salon_availibilty: {
		type: Boolean,
	},
	//ListOfSalonServices: [String]
});
const SalonTable = monogoes.model("SalonOwner", SalonSchema);

SalonRouter.post("/", async (req, res) => {
	console.log(req.body);
	try {
		let salon = await SalonTable.findOne({
			SalonOwnerEmail: req.body.email,
		});
		if (salon) return res.status(400).send("Email already exist");
		salon = await SalonTable.findOne({
			SalonOwnerphoneNumber: req.body.phoneNumber,
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
			Account_verfied: false,
			Latitude: req.body.latitude,
			Longitude: req.body.longitude,
			Salon_availibilty: true,
		});
		const salt = await bcrypt.genSalt(10);
		newSalon.password = await bcrypt.hash(newSalon.password, salt);
		try {
			await newSalon
				.save()
				.then((result) => {
					const token = jwt.sign(
						{ newSalon_account: true, id: result._id },
						"login_jwt_privatekey"
					);
					return res
						.status(200)
						.send("Request submitted sucessfully wait for verification");
				})

				.catch((error) => {
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
	console.log("put method is called");
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");

	const decode = jwt.verify(token, "login_jwt_privatekey");
	if (!decode) return res.status(400).send("invalid token");

	try {
		//	var user2 = await SalonTable.findById(decode.id);

		var user2 = await SalonTable.findById(decode.id).select({
			Salon_owner_firstName: 1,
			SalonOwnerEmail: 1,
			SalonOwnerphoneNumber: 1,
			SalonOwnerCnic: 1,
			Salon_opening_hours: 1,
			Salon_closing_hours: 1,
		});
		//	return res.status(200).send(req.body);

		const user = await SalonTable.findOne({
			SalonOwnerEmail: req.body.email,
			_id: { $ne: decode.id },
		});
		if (user) return res.status(400).send("Email already exist");
		const user1 = await SalonTable.findOne({
			SalonOwnerphoneNumber: req.body.phoneNumber,
			_id: { $ne: decode.id },
		});
		if (user1) return res.status(400).send("Phone number already exist");

		(user2.Salon_owner_firstName = req.body.name),
			(user2.SalonOwnerEmail = req.body.email),
			(user2.SalonOwnerphoneNumber = req.body.phoneNumber),
			(user2.SalonOwnerCnic = req.body.cnic),
			(user2.Salon_opening_hours = req.body.Salon_opening_hours),
			(user2.Salon_closing_hours = req.body.Salon_closing_hours);
		try {
			console.log("nefore");
			const result = await user2.save();
			console.log(result);
			return res.status(200).send(result);
		} catch (exc) {
			return res.status(400).send(exc.message);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

SalonRouter.put("/change/password", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");

		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (!decode) return res.status(400).send("invalid token");
		var user2 = await SalonTable.findById(decode.id);
		if (!user2) return res.status(400).send("Invalid id");
		console.log("bodypasword", req.body.oldpassword);
		const validpassword = await bcrypt.compare(
			req.body.oldpassword,
			user2.password
		);
		if (!validpassword) return res.status(400).send("invalid old password");
		const salt = await bcrypt.genSalt(10);
		try {
			const new_hased_password = await bcrypt.hash(
				req.body.confirmpassword,
				salt
			);
			user2.password = new_hased_password;
		} catch (exc) {
			return res.status(400).send("can not hash password successfully");
		}
		try {
			const result = await user2.save();
			return res.status(200).send(result);
		} catch (exc) {
			return res.status(400).send(exc.message);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

SalonRouter.post("/forgot/password", async (req, res) => {
	const name = await SalonTable.findOne({ SalonOwnerEmail: req.body.email });
	if (!name) return res.status(400).send("invalid email");

	let transporter = nodemailer.createTransport({
		service: "Gmail",
		//port: 587,
		secure: false,

		auth: {
			user: "fa16-bcs-347@cuilahore.edu.pk",
			pass: "pmlnpmln1234",
		},
	});

	let mailOptions = {
		from: "fa16-bcs-347@cuilahore.edu.pk",
		to: req.body.email,
		subject: "Verfication Code",
		text: Math.floor(random(10000, 100000)).toString(),
	};

	transporter.sendMail(mailOptions, function (err, info) {
		if (err) {
			return res.status(400).send(err);
		}
	});

	const new_token = new ttl_table({
		createdAt: new Date(),
		UserEmail: req.body.email,
		token: parseInt(mailOptions.text),
	});

	try {
		const save_token = await new_token.save();
		return res.status(200).send(save_token);
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

SalonRouter.post("/verify_code/and/update_password", async (req, res) => {
	console.log("helll");
	try {
		const result = await ttl_table.findOne({ token: req.body.token });
		const user = await SalonTable.findOne({
			SalonOwnerEmail: result.UserEmail,
		});

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(req.body.confirmpassword, salt);
		const save_password = await user.save();
		if (result) {
			return res.status(200).send(save_password);
		} else {
			return res.status(400).send("Invalid code");
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

SalonRouter.get("/getSingle", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const salon = await SalonTable.findOne({ _id: decode.id }).select({
				Salon_owner_firstName: 1,
				SalonOwnerEmail: 1,
				SalonOwnerphoneNumber: 1,
				SalonOwnerCnic: 1,
				Salon_opening_hours: 1,
				Salon_closing_hours: 1,
			});

			if (!salon) return res.status(400).send("Salon wit given id not found");

			return res.status(200).send(salon);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

SalonRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const salon = await SalonTable.find({
				Account_verfied: true,
				Salon_availibilty: true,
			}).select({
				SalonName: 1,
				Salon_opening_hours: 1,
				Salon_closing_hours: 1,
				_id: 1,
				Latitude: 1,
				Longitude: 1,
			});
			return res.status(200).send(salon);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});
function random(low, high) {
	return Math.random() * (high - low) + low;
}
module.exports.SalonRouter = SalonRouter;
module.exports.SalonTable = SalonTable;
