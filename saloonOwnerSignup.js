const monogoes = require("mongoose");
const middleware = require("./middleware");
const express = require("express");
const jwt = require("jsonwebtoken");

const saloonOwnerRouter = express.Router();

const saloonOwnerSchema = new monogoes.Schema({
	saloonName: { type: String, required: true, minlength: 3, maxlength: 20 },

	saloonOwnerName: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 20,
	},
	saloonOwnerEmail: { type: String, required: true, minlength: 5 },
	saloonOwnerContact: { type: String, required: true, minlength: 7 },

	password: { type: String, required: true, minlength: 8, maxlength: 25 },
});
const SalonTable = monogoes.model("SalonTable", saloonOwnerSchema);

saloonOwnerRouter.get("/", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			//  const result=await Users.find();
			const allusers = await Coustmer.find().sort("name");
			res.send(allusers);
		}
	} catch (exc) {
		res.status(400).send("Invalid token");
	}
});

saloonOwnerRouter.get("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		const singleemployee = await Coustmer.findById(req.params.id);
		if (!singleemployee) {
			res.send("Invalid user id");
		} else {
			res.send(singleemployee);
		}
	} catch (exc) {
		return res.status(400).send("Invalid token");
	}
});

saloonOwnerRouter.delete("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");
		if (decode) {
			const singleemployee = await SalonTable.deleteOne({
				_id: req.params.id,
			});
			if (!singleemployee) {
				res.send("Invalid user id");
				return;
			} else {
				res.send(singleemployee);
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});

/*Userrouter.del('/:id', async (req,res)=>{
Users.deleteOne(req.params.id)
console.log(req.send("successfuly deleted"));
})*/

saloonOwnerRouter.put("/:id", async (req, res) => {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access denied ,No token provided");
	try {
		const decode = jwt.verify(token, "login_jwt_privatekey");

		if (decode) {
			try {
				var user2 = await SalonTable.findById(req.params.id);
			} catch (ex) {
				return res.status(400).send("Invalid id");
			}

			const user = await SalonTable.findOne({
				saloonOwnerEmail: req.body.email,
			});
			if (user) return res.status(400).send("Email already exist");
			let user1 = await SalonTable.findOne({
				saloonOwnerContact: req.body.phnnbr,
			});
			if (user1) return res.status(400).send("Phone number already exist");

			// const singleemployee=await Users.findByIdAndUpdate(req.params.id,{name:req.body.name},{useremail:req.body.useremail},{password:req.body.password},{new:true});
			(user2.saloonName = req.body.salonname),
				(user2.saloonOwnerName = req.body.saloonownerName),
				(user2.saloonOwnerEmail = req.body.email),
				(user2.saloonOwnerContact = req.body.phnnbr);
			try {
				const result = await user2.save();
				return res.status(200).send(result);
			} catch (exc) {
				return res.status(400).send(exc.message);
			}
		}
	} catch (exc) {
		return res.status(400).send("Invalid Token");
	}
});

saloonOwnerRouter.post("/", async (req, res) => {
	let user = await SalonTable.findOne({ saloonOwnerEmail: req.body.email });
	if (user) {
		return res.status(400).send("email already exist");
	} else {
		//res.send("valid email");
	}
	let user1 = await SalonTable.findOne({ saloonOwnerContact: req.body.phnnbr });
	console.log(user1);
	if (user1) {
		return res.status(400).send("Phone number already exist");
	}

	const newSalon = new SalonTable({
		saloonName: req.body.salonname,
		saloonOwnerName: req.body.saloonownerName,
		saloonOwnerEmail: req.body.email,
		saloonOwnerContact: req.body.phnnbr,
		password: req.body.password,
	});

	try {
		const result = await newSalon.save();
		const token = jwt.sign(
			{ Salon_Owner_login: true, id: result._id },
			"login_jwt_privatekey"
		);
		return res.status(200).header("x-auth-token", token).send(result);
	} catch (ex) {
		return res.status(400).send(ex.message);
	}
});

//module.exports.saloonOwnerRouter = saloonOwnerRouter;
//module.exports.SalonTable = SalonTable;
//module.exports.Users = Coustmer;
