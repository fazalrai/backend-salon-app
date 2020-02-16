const nodemailer = require("nodemailer");
const xoauth2 = require("xoauth2");

/*var smtpConfig = nodemailer.createTransport("SMTP", {
	host: "smtp.gmail.com",
	secureConnection: false,
	port: 587,
	requiresAuth: true,
	domains: ["gmail.com", "googlemail.com"],
	auth: {
		user: "fa16-bcs-347@cuilahore.edu.pk",
		pass: "pmlnpmln1234"
	}
});*/
let transporter = nodemailer.createTransport({
	service: "Gmail",
	//port: 587,
	//port: 465,
	secure: false,
	auth: {
		user: "fa16-bcs-347@cuilahore.edu.pk",
		pass: "pmlnpmln1234"
		//type: "OAuth2",
		//clientId:
		//	"337624998109-m5bk33anjbn3nj06rmtilad6qetgm4h0.apps.googleusercontent.com",

		//clientSecret: "xMgq4cwGOp_ahwFQQoG04TkU"
	}
});

let mailOptions = {
	from: "fa16-bcs-347@cuilahore.edu.pk",
	to: "fazal.rai456@gmail.com",
	subject: "Message",
	text: "hy this is fazal"
	/*	auth: {
		user: "user@example.com",
		refreshToken: "1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx",
		accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
		expires: 1484314697598
	}*/
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
