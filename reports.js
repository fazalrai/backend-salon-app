const express = require("express");
const jwt = require("jsonwebtoken");

const Report_router = express.Router();
const { ServiceAppointmentTable } = require("./ServiceAppointment");
Report_router.get("/", async (req, res) => {
	try {
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied ,No token provided");
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const result = await ServiceAppointmentTable.aggregate([
				{
					$match: { Salon_id: decode.id },
				},
				{
					$group: {
						_id: "$booking_date",
						count: { $sum: 1 },
					},
				},

				{
					$sort: { _id: 1 },
				},
			]);
			// const result = await ServiceAppointmentTable.find({
			// 	Salon_id: decode.id,
			// }).sort({
			// 	booking_date: 1,
			// });
			console.log("result is", result);
			// .count()
			// .sort({ booking_date: 1 })
			// .select({ _id: 0, booking_date });
			return res.status(200).send(result);
		}
	} catch (exc) {
		return res.status(400).send(exc.message);
	}
});

module.exports.Report_router = Report_router;
