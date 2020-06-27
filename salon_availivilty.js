const monogoes = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const { SalonTable } = require("./Salon_signup");
const salon_availibilty_router = express.Router();

salon_availibilty_router.post("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			const salon = await SalonTable.findById(decode.id);
			console.log("salon is", salon);
			salon.Salon_availibilty = req.body.Salon_availibilty;
			const result = await salon.save();
			return res.status(200).send(result);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

module.exports.salon_availibilty_router = salon_availibilty_router;
