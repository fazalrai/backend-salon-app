const monogoes = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const { SalonTable } = require("./Salon_signup");
const SuperadminRouter = express.Router();
const SuperAdminSchema = new monogoes.Schema({
	SuperAdminName: { type: String, required: true, minlength: 3, maxlength: 20 },
	SuperAdminEmail: { type: String, required: true, minlength: 7 },
	password: { type: String, required: true, minlength: 8, maxlength: 70 },
	phonenumber: { type: Number, required: true, minlength: 11, maxlength: 15 }
	//	isAdmin: Boolean
});
const SuperAdminTable = monogoes.model("SuperAdminTable", SuperAdminSchema);
SuperadminRouter.post("/", async (req, res) => {
	let user = await SuperAdminTable.findOne({ SuperAdminEmail: req.body.email });
	//console.log(user);
	if (user) {
		return res.status(400).send("email already exist");
	}
	const newsuperadmin = new SuperAdminTable({
		SuperAdminName: req.body.name,
		SuperAdminEmail: req.body.email,
		password: req.body.password,
		phonenumber: req.body.phonenumber
	});
	const salt = await bcrypt.genSalt(10);
	newsuperadmin.password = await bcrypt.hash(newsuperadmin.password, salt);

	try {
		const result = await newsuperadmin.save();
		const token = jwt.sign(
			{ Super_admin_login: true, id: result._id },
			"login_jwt_privatekey"
		);
		return res
			.status(200)
			.header("x-auth-token", token)
			.send(result);
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
});

SuperadminRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const result = await SalonTable.find({ Account_verfied: false });
			return res.status(200).send(result);
		}
	} catch (exc) {
		return res.status(400).send("bad request error");
	}
});
SuperadminRouter.get("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const salon = await SalonTable.findOne({ _id: req.params.id });
			console.log(salon);

			salon.Account_verfied = true;

			const result = await salon.save();
			const remainig_salon = await SalonTable.find({ Account_verfied: false });

			let transporter = nodemailer.createTransport({
				service: "Gmail",
				//port: 587,
				secure: false,

				auth: {
					user: "fa16-bcs-347@cuilahore.edu.pk",
					pass: "pmlnpmln1234"
				}
			});

			let mailOptions = {
				from: "fa16-bcs-347@cuilahore.edu.pk",
				to: salon.SalonOwnerEmail,
				subject: "Account verfication",
				text:
					"Your account has been vaerified successfully.Click the given below link to proceed login"
			};

			transporter.sendMail(mailOptions, function(err, info) {
				if (err) {
					return res.status(400).send(err);
				}
			});

			return res.status(200).send(remainig_salon);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

SuperadminRouter.put("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				var user2 = await SuperAdminTable.findById(decode.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}
			const user = await SuperAdminTable.findOne({
				SuperAdminEmail: req.body.email,
				_id: { $ne: decode.id }
			});
			if (user) return res.status(400).send("Email already exist");

			user2.SuperAdminEmail = req.body.email;
			user2.SuperAdminName = req.body.name;
			user2.phonenumber = req.body.phonenumber;
			try {
				const result = await user2.save();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(exc.message);
			}
		}
	} catch (exc) {
		return res.status(400).send("invalid token");
	}
});

SuperadminRouter.put("/update/password", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				var user2 = await SuperAdminTable.findById(decode.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}

			user2.password = req.body.password;

			try {
				const result = await user2.save();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(ex.message);
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});

SuperadminRouter.put("/change/password", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");

		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (!decode) return res.status(400).send("invalid token");
		var user2 = await SuperAdminTable.findById(decode.id);
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

module.exports.SuperadminRouter = SuperadminRouter;
module.exports.SuperAdminTable = SuperAdminTable;
