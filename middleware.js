const jwt = require("jsonwebtoken");

function auth(req) {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode.isAdmin) {
			next();
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
}

module.exports.auth = auth;
