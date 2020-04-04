const monogoes = require("mongoose");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");

const express = require("express");
const bodyparser = require("body-parser");
const UserSignup_router = require("./UsersSignup");
const Userlogin_router = require("./Userlogin");
const SalonRouter = require("./Salon_signup");
const saloonOwner_login_Router = require("./saloonOwnerlogin");
const saloonServicesRouter = require("./saloonServices");
const superadminrouter = require("./Superadmin");
const SuperAdmin_login_router = require("./SuperAdminlogin");
const service_appointment_router = require("./ServiceAppointment");
const customer_schedule_router = require("./Schedule");
const { Salon_Schedule_router } = require("./SalonSchedule");
const { salon_availibilty_router } = require("./salon_availivilty");
const connectDB = require("./connectivity");
const helmet = require("helmet");
const compression = require("compression");
const gcobject = new Storage({
	keyFilename: path.join(
		__dirname,
		"./config/uploading-images-272407-55aa055e5526.json"
	),
	projectId: "uploading-images-272407"
});

const bucket = gcobject.bucket("fyp-images");
const multerMid = multer({
	storage: multer.memoryStorage(),
	limits: {
		// no larger than 5mb.
		fileSize: 5 * 1024 * 1024
	}
});

const cors = require("cors");
connectDB();

const app = express();

app.disable("x-powered-by");
app.use(multerMid.single("image"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(express.static("public"));
//app.use(express.urlencoded({ extended: true }));
//app.use(multer());
// app.use(
// 	cors({
// 		//origin: "http://localhost:8080",
// 		//	credentials: true,
// 		exposedHeaders: ["x-auth-token"]
// 	})
// );
//app.use(helmet());
//app.use(compression());
app.use(express.json());
/*if(!config.get('jwtpk')){
    console.log("FATAL error...jwt primary key is not defined");
    process.exit(1);
}*/
//app.use(cors());
app.use(
	cors({
		exposedHeaders: ["x-auth-token"]
	})
);
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin,X-Requested-With,Content-Type,Accept,Authorization"
	);
	if (req.method == "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE");
		res.status(200).json({});
	}

	next();
});

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
app.use(
	"/Digital_Saloon.com/api/customer/schedule",
	customer_schedule_router.ScheduleRouter
);
app.use("/Digital_Saloon.com/api/Saloon_owner/schedule", Salon_Schedule_router);
app.use(
	"/Digital_Saloon.com/api/book/appointment",
	service_appointment_router.ServiceAppointmentRouter
);
bucket.getFiles().then(function(data) {
	const files = data[0];
	//console.log("files are", files);
});
app.use("/Digital_Saloon.com/api/Salon/availibilty", salon_availibilty_router);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Listening succesfully on port ...", port));
console.log(__dirname);
console.log(__filename);

module.exports.bucket = bucket;
