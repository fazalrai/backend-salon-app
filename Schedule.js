const monogoes = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const { SalonTable } = require("./Salon_signup");
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
//to get salonschedule
ScheduleRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			//const list_of_salon_services=SaloonTable.find(_)
			//  const result=await Users.find();

			try {
				const all_Onqueue_services = await ServiceAppointmentTable.find({
					service_status: "onqueue"
				}).select({ service_id: 1, _id: 0 });
				const rzlt = all_Onqueue_services.map(obj => {
					return obj["service_id"];
				});
				//	const rs = Object.keys(all_Onqueue_services).map(key => {
				//		return all_Onqueue_services[key];
				//	});
				//return res.status(200).send(rzlt);
				const list_of_salon_services = await SalonTable.find({
					_id: decode.id
				}).select({ ListOfSalonServices: 1, _id: 0 });

				const p2 = list_of_salon_services.map(obj => {
					return obj["ListOfSalonServices"];
				});
				const p3 = p2[0];

				//	const j = rzlt.filter(value => {
				//		p3.includes(value);
				//	});
				return res.status(200).send(j);
			} catch (exc) {
				//});
				//	const l = [];
				//	var i;
				//	for (i = 0; i < list_of_salon_services.length; i++) {
				//		console.log(list_of_salon_services[i]);
				//	}
				//const rh = list_of_salon_services.map(function(item) {
				//	if (rzlt.includes(item)) {
				//l.push(item);
				//		return res.send(item);
				//	}
				//});
				//	const rs = { $setIntersection: [list_of_salon_services, rzlt] };

				return res.status(400).send(exc.message);
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});

ScheduleRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			const customerservices = await ServiceAppointmentTable.find({
				customer_id: req.params.id
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
