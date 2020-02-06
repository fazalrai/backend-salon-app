const monogoes = require("mongoose");
const express = require("express");
const UserSignup_router = require("./UsersSignup");
const Userlogin_router = require("./Userlogin");
const SalonRouter = require("./Salon_signup");
const saloonOwner_login_Router = require("./saloonOwnerlogin");
const saloonServicesRouter = require("./saloonServices");
const superadminrouter = require("./Superadmin");
const SuperAdmin_login_router = require("./SuperAdminlogin");
const service_appointment_router = require("./ServiceAppointment");
const schedule_router = require("./Schedule");
//const config = require("config");
//const userroute = require("./addusers");
//const auth = require("./auth");
//const cors = require("cors");
const app = express();
app.use(express.json());
/*if(!config.get('jwtpk')){
    console.log("FATAL error...jwt primary key is not defined");
    process.exit(1);
}*/
//app.use(cors());
if (!" login_jwt_privatekey") {
	console.error("FATAL ERROR,jwt private key is not defined");
	process.exit(1);
}
app.use("/Digital_Saloon.com/api/UserSignUp", UserSignup_router.Userrouter);
app.use(
	"/Digital_Saloon.com/api/UserLogin",
	Userlogin_router.User_login_router
);
app.use("/Digital_Saloon.com/api/SalonSignUp", SalonRouter.SalonRouter);
app.use(
	"/Digital_Saloon.com/api/salonservices",
	saloonServicesRouter.saloonServicesRouter
);
app.use(
	"/Digital_Saloon.com/api/superadmin",
	superadminrouter.SuperadminRouter
);
app.use(
	"/Digital_Saloon.com/api/login/superadmin",
	SuperAdmin_login_router.SuperAdmin_login_router
);
app.use(
	"/Digital_Saloon.com/api/login/salonOwner",
	saloonOwner_login_Router.SalonOwner_login_router
);
app.use("/Digital_Saloon.com/api/schedule", schedule_router.ScheduleRouter);
app.use(
	"/Digital_Saloon.com/api/book/appointment",
	service_appointment_router.ServiceAppointmentRouter
);

monogoes
	.connect("mongodb://localhost/fypdatabase")
	.then(() => console.log("connected successfuly"))
	.catch(() => console.error("Couldnot connected to mongodb..", err));
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Listening succesfully on port ...", port));
//UserSignup_router.Creatuser();
