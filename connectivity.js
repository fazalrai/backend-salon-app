const mongoose = require("mongoose");

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
		);
		console.log("MongoDB Connected...");
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

mongoose.Promise = global.Promise;

module.exports = connectDB;
