const monogoes = require("mongoose");
const SalonTable = require("./Salon_signup");
const express = require("express");

const SuperadminRouter = express.Router();
const SuperAdminSchema = new monogoes.Schema({
	SuperAdminName: { type: String, required: true, minlength: 3, maxlength: 20 },
	SuperAdminEmail: { type: String, required: true, minlength: 7 },
	password: { type: String, required: true, minlength: 8, maxlength: 25 },
	isAdmin: Boolean
});
const SuperAdminTable = monogoes.model("SuperAdminTable", SuperAdminSchema);
SuperadminRouter.post("/", async (req, res) => {
	let user = await SuperAdminTable.findOne({ SuperAdminEmail: req.body.email });
	//console.log(user);
	if (user) {
		return res.status(400).send("email already exist");
	} else {
		//res.send("valid email");
	}
	const newsuperadmin = new SuperAdminTable({
		SuperAdminName: req.body.name,
		SuperAdminEmail: req.body.email,
		password: req.body.password,
		isAdmin: req.body.isAdmin
	});
	try {
		const result = await newsuperadmin.save();
		const token = jwt.sign({ Super_admin_login: true }, "login_jwt_privatekey");
		return res
			.status(200)
			.header("x-auth-token", token)
			.send(result);
	} catch (ex) {
		return res.status(400).send(ex.message);
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
			user2.isAdmin = req.body.isAdmin;

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

module.exports.SuperadminRouter = SuperadminRouter;
module.exports.SuperAdminTable = SuperAdminTable;
