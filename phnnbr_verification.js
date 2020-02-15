const express = require("express");

const forget_password_router = express.Router();

var user; //to find which user
var TeleSignSDK = require("telesignsdk");
var digit; //to store 4 digit code send to user
const { UserTable } = require("./UsersSignup");
const { SalonTable } = require("./Salon_signup");
forget_password_router.post("/", async (req, res) => {
	user = UserTable.findOne({ phoneNumber: req.body.phnnbr });
	if (user) const customerId = "9F66B2BC-623D-4351-8687-884B5A723C92";
	const apiKey =
		"xNJ8n/FtprpI6XcPcz/4oWBy3wlaGh9na/4xEMtNlqitYaAKnEf5JSqbCh6oPaBE0yaxOOAKX6bmPg6cqaMeaQ==";
	const rest_endpoint = "https://rest-api.telesign.com";
	const timeout = 10 * 1000; // 10 secs

	const client = new TeleSignSDK(
		customerId,
		apiKey,
		rest_endpoint,
		timeout // optional
		// userAgent
	);
	//console.log(digit);

	const phoneNumber = req.body.phnnbr; //req.body.phnnbr;
	digit = Math.floor(random(1000, 10000));
	const messageType = "ARN";

	//console.log("## MessagingClient.message ##");

	function messageCallback(error, responseBody) {
		if (error === null) {
			//console.log(
			//	`Messaging response for messaging phone number: ${phoneNumber}` +
			//		` => code: ${responseBody["status"]["code"]}` +
			//		`, description: ${responseBody["status"]["description"]}`
			//);
			return res
				.status(200)
				.send("enter the verfication code send to your number");
		} else {
			return res.status(400).send(error);
			//console.error("Unable to send message. " + error);
		}
	}
	client.sms.message(messageCallback, phoneNumber, message, messageType);
});
function random(low, high) {
	return Math.random() * (high - low) + low;
}
//console.log(digit);
