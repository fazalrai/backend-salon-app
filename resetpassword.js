const express = require("express");
const nodemailer = require("nodemailer");
const xoauth2 = require("xoauth2");
const Reset_password_router = express.Router();

//Reset_password_router.post("/", async (req, res) => {
const transporter = nodemailer.createTransport({
	host: "gmail.com",
	//port: 465,
	secure: false,
	//service: "gmail",
	auth: {
		xoauth2: xoauth2.createXOAuth2Generator({
			user: "fazal.rai456@gmail.com",
			clientId:
				"337624998109-m5bk33anjbn3nj06rmtilad6qetgm4h0.apps.googleusercontent.com",
			clientSecret: "xMgq4cwGOp_ahwFQQoG04TkU",
			refreshToken:
				"1//04fU9lV-vawfdCgYIARAAGAQSNwF-L9IrY2uOmkYFurWt0GfmWA1EG__-qHn_Of7uVPpVbCajeca_hWmChHyZAcNEWaYpCX6vZr8"
		})
	}
});

var mailOptions = {
	from: "fazal.rai456@gmail.com",
	to: "fa16-bcs-347@cuilahore.edu.pk",
	subject: "Reset Password Verfication code",
	text: "hy fazal"
	// Math.floor(random(1000, 10000))
};
transporter.sendMail(mailOptions, function(err, info) {
	if (err) {
		console.log(err);
		//return res.status(400).send(err.message);
	} else {
		console.log("its ok");
		//return res.status(200).send(info);
	}
});
function random(low, high) {
	return Math.random() * (high - low) + low;
}
//});

module.exports.Reset_password_router = Reset_password_router;
