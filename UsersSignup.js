const monogoes = require("mongoose");
var TeleSignSDK = require("telesignsdk");
const nodemailer = require("nodemailer");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Userrouter = express.Router();
var name;
const userSchema = new monogoes.Schema({
	UserName: { type: String, required: true, minlength: 3, maxlength: 20 },
	UserEmail: { type: String, required: true },
	password: { type: String, required: true, minlength: 8, maxlength: 125 },
	phoneNumber: { type: Number, required: true, minlength: 10, maxlength: 15 }
});

const ttl_schema = new monogoes.Schema({
	UserEmail: { type: String, required: true },
	createdAt: { type: Date, required: true },
	token: { type: Number, required: true }
});

const ttl_table = monogoes.model("ttl_table", ttl_schema);

const UserTable = monogoes.model("UserTable", userSchema);

Userrouter.put("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				var user2 = await UserTable.findById(decode.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}

			const user = await UserTable.findOne({
				UserEmail: req.body.email,
				_id: { $ne: decode.id }
			});
			if (user) return res.status(400).send("Email already exist");
			let user1 = await UserTable.findOne({
				phoneNumber: req.body.phnnbr,
				_id: { $ne: decode.id }
			});
			if (user1) return res.status(400).send("Phone number already exist");

			(user2.UserName = req.body.name),
				(user2.UserEmail = req.body.email),
				(user2.phoneNumber = req.body.phnnbr);

			//	user2.password = req.body.password;
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

Userrouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			let users = await UserTable.find();
			return res.status(200).send(users);
		}
	} catch (exc) {
		return res.status(400).send("Invalid token");
	}
});
Userrouter.post("/", async (req, res) => {
	let user = await UserTable.findOne({ UserEmail: req.body.email });
	//console.log(user);
	if (user) {
		return res.status(400).send("email already exist");
	}
	let user1 = await UserTable.findOne({ phoneNumber: req.body.phnnbr });
	//	console.log(user1);
	if (user1) {
		return res.status(400).send("Phone number already exist");
	}
	//else {
	//		res.send("valid phnnbr");
	//}
	//console.log(req.body);

	const newuser = new UserTable({
		UserName: req.body.name,
		UserEmail: req.body.email,
		password: req.body.password,
		phoneNumber: req.body.phnnbr
	});

	const salt = await bcrypt.genSalt(10);
	newuser.password = await bcrypt.hash(newuser.password, salt);
	try {
		const result = await newuser.save();
		const token = jwt.sign(
			{ login: true, id: result._id },
			"login_jwt_privatekey"
		);

		return res
			.status(200)
			.header("x-auth-token", token)
			.send("token suucessfully sent");
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
});

Userrouter.put("/change/password", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");

		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (!decode) return res.status(400).send("invalid token");
		var user2 = await UserTable.findById(decode.id);
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

Userrouter.post("/forgot/password", async (req, res) => {
	const name = await UserTable.findOne({ UserEmail: req.body.email });
	if (!name) return res.status(400).send("invalid email");

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
		to: req.body.email,
		subject: "Verfication Code",
		text: Math.floor(random(10000, 100000)).toString()
	};

	transporter.sendMail(mailOptions, function(err, info) {
		if (err) {
			return res.status(400).send(err);
		}
	});

	const new_token = new ttl_table({
		createdAt: new Date(),
		user_email: req.body.email,
		token: parseInt(mailOptions.text)
	});

	const already_token = await ttl_table
		.findOne({ user_email: req.body.email })
		.select({ token });

	if (already_token) {
		already_token.token = new_token.token;
		try {
			let save_token = await already_token.save();
			return res.status(200).send("token sent successfully", save_token);
		} catch (exc) {}
	} else {
		try {
			let save_token = await new_token.save();
			return res.status(200).send("token sent successfully", save_token);
		} catch (exc) {
			return res.status(400).send(exc.message);
		}
	}
});

function random(low, high) {
	return Math.random() * (high - low) + low;
}
Userrouter.post("/verify_code/and/update_password", async (req, res) => {
	const result = await ttl_table.findOne({ token: req.body.token });
	if (result) {
		return res.status(200).send(result);
	} else {
		return res.status(400).send("Invalid code");
	}
});

//below one is for phnnbr
Userrouter.post("/forgot/pasord", async (req, res) => {
	name = await UserTable.findOne({ UserEmail: req.body.email });
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

module.exports.Userrouter = Userrouter;
module.exports.UserTable = UserTable;
//module.exports.Creatuser = Creatuser;
