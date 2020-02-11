const express = require("express");
const { SalonTable } = require("./Salon_signup");
const jwt = require("jsonwebtoken");
const SalonOwner_login_router = express.Router();
SalonOwner_login_router.post("/", async (req, res) => {
	try {
		const user = await SalonTable.findOne({
			SalonOwnerEmail: req.body.email,
			password: req.body.password
		});
		if (user) {
			const token = jwt.sign(
				{ Salon_Owner_login: true, id: user._id },
				"login_jwt_privatekey"
			);
			return res
				.status(200)
				.header("x-auth-token", token)
				.send(user);
		} else {
			return res.status(400).send("Invalid login");
		}
	} catch (error) {
		return res.status(400).send(error.message);
	}
});
module.exports.SalonOwner_login_router = SalonOwner_login_router;
