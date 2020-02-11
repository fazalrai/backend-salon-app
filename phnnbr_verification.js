var TeleSignSDK = require("telesignsdk");

const customerId = "9F66B2BC-623D-4351-8687-884B5A723C92";
const apiKey =
	"xNJ8n/FtprpI6XcPcz/4oWBy3wlaGh9na/4xEMtNlqitYaAKnEf5JSqbCh6oPaBE0yaxOOAKX6bmPg6cqaMeaQ==";
const rest_endpoint = "https://rest-api.telesign.com";
const timeout = 10 * 1000; // 10 secs

const client = new TeleSignSDK(
	customerId,
	apiKey,
	timeout // optional
	// userAgent
);

const phoneNumber = "923034270844";
const message = "Naeem your verification code is 1122.send by fazal rai";
const messageType = "ARN";

//console.log("## MessagingClient.message ##");

function messageCallback(error, responseBody) {
	if (error === null) {
		console.log(
			`Messaging response for messaging phone number: ${phoneNumber}` +
				` => code: ${responseBody["status"]["code"]}` +
				`, description: ${responseBody["status"]["description"]}`
		);
	} else {
		console.error("Unable to send message. " + error);
	}
}
client.sms.message(messageCallback, phoneNumber, message, messageType);
