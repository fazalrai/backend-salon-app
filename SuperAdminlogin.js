const express = require("express");
const { SuperAdminTable } = require("./Superadmin");
const jwt = require("jsonwebtoken");
const SuperAdmin_login_router = express.Router();
SuperAdmin_login_router.post("/", async (req, res) => {
	try {
		const user = await SuperAdminTable({
			SuperAdminEmail: req.body.email,
			password: req.body.password
		});
		if (user) {
			const token = jwt.sign(
				{ Super_admin_login: true },
				"login_jwt_privatekey"
			);

			res.status(200).send(token);
		} else {
			res.status(400).send(" Invalid login ");
		}
	} catch (error) {
		return res.status(400).send(error.message);
	}
});
function auth(req, res, next) {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		return decode;
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
}

module.exports.SuperAdmin_login_router = SuperAdmin_login_router;
