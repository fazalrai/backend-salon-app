const mongoose = require("mongoose");
const key = require("./keys").mongoURI;
const connectDB = async () => {
	try {
		await mongoose.connect(key, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		});
		console.log("MongoDB Connected...");
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

mongoose.Promise = global.Promise;

module.exports = connectDB;
