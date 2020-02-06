const monogoes = require("mongoose");

const express = require("express");
const jwt = require("jsonwebtoken");
const Userrouter = express.Router();

const userSchema = new monogoes.Schema({
	UserName: { type: String, required: true, minlength: 3, maxlength: 20 },
	UserEmail: { type: String, required: true, minlength: 7 },
	password: { type: String, required: true, minlength: 8, maxlength: 25 },
	phoneNumber: { type: Number, required: true, minlength: 10, maxlength: 15 }
});
const UserTable = monogoes.model("UserTable", userSchema);

Userrouter.put("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			try {
				var user2 = await UserTable.findById(req.params.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}

			const user = await UserTable.findOne({
				UserEmail: req.body.email,
				_id: { $ne: req.params.id }
			});
			if (user) return res.status(400).send("Email already exist");
			let user1 = await UserTable.findOne({
				phoneNumber: req.body.phnnbr,
				_id: { $ne: req.params.id }
			});
			if (user1) return res.status(400).send("Phone number already exist");

			(user2.UserName = req.body.name),
				(user2.UserEmail = req.body.email),
				(user2.password = req.body.password),
				(user2.phoneNumber = req.body.phnnbr);
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
	} else {
		//res.send("valid email");
	}

	let user1 = await UserTable.findOne({ phoneNumber: req.body.phnnbr });
	console.log(user1);
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
	try {
		const result = await newuser.save();
		const token = jwt.sign({ login: true }, "login_jwt_privatekey");

		return res
			.status(200)
			.header("x-auth-token", token)
			.send(result);
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
	//await newuser.save().then(rzlt=> res.status(200).send(rzlt))
	//.catch(err=>res.status(400).send(err))
	//return res.status(200).send(result);
});

//async function Creatuser() {
//	const newuser = new UserTable({
//UserName: req.body.UserName,
//UserEmail: req.body.UserEmail,
//password: req.body.password,
//phoneNumber: req.body.phoneNumber
//		UserName: "fazal rai",
//		UserEmail: "abc4343444",
//		password: "abc12333",
//	phoneNumber: 202032334
//	});

//	const result = await newuser.save();
//}

module.exports.Userrouter = Userrouter;
module.exports.UserTable = UserTable;
//module.exports.Creatuser = Creatuser;
