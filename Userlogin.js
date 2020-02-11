const express = require("express");
const { UserTable } = require("./UsersSignup");
const jwt = require("jsonwebtoken");
const User_login_router = express.Router();
User_login_router.post("/", async (req, res) => {
	try {
		const user = await UserTable.findOne({
			UserEmail: req.body.useremail,
			password: req.body.password
		});
		if (user) {
			const token = jwt.sign({ login: true }, "login_jwt_privatekey");
			res.status(200).send(token);
		} else {
			res.status(400).send(" Invalid login ");
		}
	} catch (error) {
		return res.status(400).send(error.message);
	}
});

module.exports.User_login_router = User_login_router;
