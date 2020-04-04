const bucket = require("./index");

const uploadImage = file =>
	new Promise((resolve, reject) => {
		const { originalname, buffer } = file;

		const blob = bucket.bucket.file(originalname.replace(/ /g, "_"));
		const blobStream = blob.createWriteStream({
			resumable: false
		});
		blobStream
			.on("finish", () => {
				const publicUrl = `https://storage.googleapis.com/${bucket.bucket.name}/${blob.name}`;

				resolve(publicUrl);
			})
			.on("error", () => {
				reject(`Unable to upload image, something went wrong`);
			})
			.end(buffer);
	});
module.exports.uploadImage = uploadImage;
