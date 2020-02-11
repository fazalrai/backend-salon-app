const express = require("express");
const nodemailer = require("nodemailer");
const Reset_password_router = express.Router();

Reset_password_router.post("/", async (req, res) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			xoauth2: xoauth2.createXOAuth2Generator({
				user: "fazal.rai456@gmail.com",
				clientId: "",
				clientSecret: "",
				refreshToken: ""
			})
		}
	});

	var mailOptions = {
		from: "fazal.rai456@gmail.com",
		to: req.body.email,
		subject: "Reset Password Verfication code",
		text: Math.floor(random(1000, 10000))
	};
	transporter.sendMail(mailOptions, function(err, info) {
		if (err) {
			return res.status(400).send(err.message);
		} else {
			return res.status(200).send(info);
		}
	});
	function random(low, high) {
		return Math.random() * (high - low) + low;
	}
});
module.exports.Reset_password_router = Reset_password_router;
