const express = require("express");
const { SuperAdminTable } = require("./Superadmin");
const jwt = require("jsonwebtoken");
const SuperAdmin_login_router = express.Router();
SuperAdmin_login_router.post("/", async (req, res) => {
	try {
		const user = await SuperAdminTable.findOne({
			SuperAdminEmail: req.body.email,
			password: req.body.password
		});
		if (!user) return res.status(400).send("Invalid  username or password");
		const validpassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!validpassword) return res.status(400).send("invalid password");
		const token = await jwt.sign(
			{ SuperAdmin: true, id: user._id },
			"login_jwt_privatekey"
		);
		return res
			.status(200)
			.header("x-auth-token", token)
			.send("login successfully");
	} catch (error) {
		return res.status(400).send(error.message);
	}
});

// function auth(req, res, next) {
// 	const token = req.header("x-auth-token");
// 	if (!token) return res.status(401).send("Access denied ,No token provided");
// 	try {
// 		const decode = jwt.verify(token, "login_jwt_privatekey");
// 		return decode;
// 	} catch (exc) {
// 		return res.status(400).send("Invalid Token");
// 	}
// }

module.exports.SuperAdmin_login_router = SuperAdmin_login_router;
