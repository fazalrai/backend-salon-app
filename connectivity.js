const mongoose = require("mongoose");
//const key = require("./keys").mongoURI;
const connectDB = async () => {
	try {
		await mongoose.connect(
			"mongodb://fazal:pmlnpmln1234@ds123181.mlab.com:23181/fyp",
			{
				useNewUrlParser: true,
				useCreateIndex: true,
				useFindAndModify: false,
				useUnifiedTopology: true
			}
			//	{ reconnectTries: 30, reconnectInterval: 1000 }
		);
		console.log("MongoDB Connected...");
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

mongoose.Promise = global.Promise;

module.exports = connectDB;
