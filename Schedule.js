const monogoes = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const { SaloonTable } = require("./Salon_signup");
const ScheduleRouter = express.Router();
const { ServiceAppointmentTable } = require("./ServiceAppointment");

ScheduleRouter.get("/customers/history", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			//  const result=await Users.find();
			try {
				const allusers = await ServiceAppointmentTable.find({
					service_status: "availed"
				}); //.sort("name");
				return res.status(200).send(allusers);
			} catch (exc) {
				return res.status(400).send(exc.message);
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});
ScheduleRouter.get("/customers/history/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			const customerservices = await ServiceAppointmentTable.find({
				customer_id: req.params.id,
				service_status: "availed"
			});
			if (!customerservices) {
				res.send("Invalid user id");
			} else {
				res.send(customerservices);
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
	//  const result=await Users.find();
});

ScheduleRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			//const list_of_salon_services=SaloonTable.find(_)
			//  const result=await Users.find();
			try {
				const allusers = await ServiceAppointmentTable.find({
					service_status: "onqueue"
				});

				return res.status(200).send(allusers);
			} catch (exc) {
				return res.status(400).send(exc.message);
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});

ScheduleRouter.get("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			const customerservices = await ServiceAppointmentTable.find({
				customer_id: req.params.id,
				service_status: "onqueue"
			});
			if (customerservices) {
				return res.status(200).send(customerservices);
			} else {
				res.status(400).send("Invalid id");
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
	//  const result=await Users.find();
});

module.exports.ScheduleRouter = ScheduleRouter;
