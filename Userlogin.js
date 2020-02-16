const express = require("express");
const bcrypt = require("bcrypt");
const { UserTable } = require("./UsersSignup");
const jwt = require("jsonwebtoken");
const User_login_router = express.Router();
User_login_router.post("/", async (req, res) => {
	try {
<<<<<<< HEAD
		await UserTable.findOne({
			UserEmail: req.body.email,
			password: req.body.password
		})
			.then(user => {
				const token = jwt.sign(
					{ login: true, id: user._id },
					"login_jwt_privatekey"
				);
				return res
					.header("x-auth-token", token)
					.status(200)
					.send(user);
			})
			.catch(err => {
				return res.status(400).send(" Invalid login ");
			});
=======
		const user = await UserTable.findOne({
			UserEmail: req.body.email
		});

		if (!user) return res.send(400).send("Invalid email");

		const validpassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		//return res.status(400).send(validpassword);
		if (!validpassword) return res.status(400).send("invalid password");

		const token = await jwt.sign(
			{ login: true, id: user._id },
			"login_jwt_privatekey"
		);
		return res.status(200).send(token);
>>>>>>> fazal
	} catch (error) {
		return res.status(400).send(error.message);
	}
});

module.exports.User_login_router = User_login_router;
