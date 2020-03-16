const express = require("express");
const { SalonTable } = require("./Salon_signup");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SalonOwner_login_router = express.Router();
SalonOwner_login_router.post("/", async (req, res) => {
	//	console.log(req.body);
	try {
		const user = await SalonTable.findOne({
			SalonOwnerEmail: req.body.email
		});
		//	console.log("user is ", user);

		if (!user) return res.status(400).send("Invalid  username or password");
		const validpassword = await bcrypt.compare(
			req.body.password,
			user.password
		);

		if (!validpassword) return res.status(400).send("invalid password");
		if (user.Account_verfied) {
			const token = await jwt.sign(
				{ Salon_Owner_login: true, id: user._id },
				"login_jwt_privatekey"
			);
			return res
				.status(200)
				.header("x-auth-token", token)
				.send("login successfully");
		} else {
			return res.status(403).send("Forbidden request");
		}
	} catch (error) {
		res.status(400).send(error.message);
	}
});
module.exports.SalonOwner_login_router = SalonOwner_login_router;
