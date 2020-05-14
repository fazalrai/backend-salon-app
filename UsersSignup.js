const monogoes = require("mongoose");
var TeleSignSDK = require("telesignsdk");
const nodemailer = require("nodemailer");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Userrouter = express.Router();
const userSchema = new monogoes.Schema({
	UserName: { type: String, required: true, minlength: 3, maxlength: 20 },
	UserEmail: { type: String, required: true },
	password: { type: String, required: true, minlength: 8, maxlength: 125 },
	phoneNumber: { type: Number, required: true, minlength: 10, maxlength: 15 },
	Account_verfied: {
		type: Boolean,
		required: true,
	},
});

const ttl_schema = new monogoes.Schema({
	UserEmail: { type: String, required: true },
	createdAt: { type: Date, required: true },
	token: { type: Number, required: true },
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
				_id: { $ne: decode.id },
			});
			if (user) return res.status(400).send("Email already exist");
			let user1 = await UserTable.findOne({
				phoneNumber: req.body.phnnbr,
				_id: { $ne: decode.id },
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
				return res.status(400).send(exc.message);
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
			const users = await UserTable.find({ _id: decode.id }).select({
				UserName: 1,
				UserEmail: 1,
				phoneNumber: 1,
				_id: 0,
			});
			return res.status(200).send(users);
		}
	} catch (exc) {
		return res.status(400).send("Invalid token");
	}
});
Userrouter.post("/", async (req, res) => {
	const user = await UserTable.findOne({ UserEmail: req.body.email });
	if (user) {
		return res.status(400).send("email already exist");
	}
	const user1 = await UserTable.findOne({ phoneNumber: req.body.phnnbr });
	if (user1) {
		return res.status(400).send("Phone number already exist");
	}

	const newuser = new UserTable({
		UserName: req.body.name,
		UserEmail: req.body.email,
		password: req.body.password,
		phoneNumber: req.body.phnnbr,
		Account_verfied: false,
	});

	const salt = await bcrypt.genSalt(10);
	newuser.password = await bcrypt.hash(newuser.password, salt);
	try {
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
		const save_token = await new_token.save();

		const result = await newuser.save();

		return res.status(200).send("token suucessfully sent");
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
});

Userrouter.post("/verify/account/token", async (req, res) => {
	try {
		const result = await ttl_table.findOne({ token: req.body.token });
		const user = await UserTable.findOne({ UserEmail: result.UserEmail });
		user.Account_verfied = true;
		const results = await user.save();
		const token = jwt.sign({ id: results._id }, "login_jwt_privatekey");
		res
			.header("x-auth-token", token)
			.status(200)
			.send("token verfied successfully ");
	} catch (exc) {
		return res.status(400).send(exc.message);
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

	// const already_token = await ttl_table
	// 	.findOne({ user_email: req.body.email })
	// 	.select({ token });

	// if (already_token) {
	// 	already_token.token = new_token.token;
	// 	try {
	// 		let save_token = await already_token.save();
	// 		return res.status(200).send("token sent successfully", save_token);
	// 	} catch (exc) {}
	// } else {
	try {
		const save_token = await new_token.save();
		return res.status(200).send(save_token);
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

function random(low, high) {
	return Math.random() * (high - low) + low;
}
Userrouter.post("/verify_code/and/update_password", async (req, res) => {
	//	const to_check_table_exist = ttl_table.find();

	const result = await ttl_table.findOne({ token: req.body.token });
	const user = await UserTable.findOne({ UserEmail: result.UserEmail });

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(req.body.confirmpassword, salt);
	const save_password = await user.save();
	if (result) {
		return res.status(200).send(save_password);
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
module.exports.ttl_table = ttl_table;
//module.exports.Creatuser = Creatuser;
