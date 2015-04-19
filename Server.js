/*
 * File Name : Server.js
 * Task : Run Server and fetch multiple emails from DB to send reminder
 * Invoke all the email task at once and update DB once the email is sent 
*/

/*
 * Load all the required modules 
*/

var async = require("async");
var http = require("http");
var nodemailer = require("nodemailer");
// This will store emails needed to send.
var listofemails = ["rwtc66@gmail.com","shahid@codeforgeek.com"]; 
// Will store email sent successfully.
var success_email = [];
// Will store email whose sending is failed. 
var failure_email = [];

var transporter;

/* Loading modules done. */

function massMailer() {
	var self = this;
	transporter = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: "shahid@reach1to1.com",
			pass: "shahid598"
		}
	});
	// Fetch all the emails from database and push it in listofemails
	self.invokeOperation();
};

/* Invoking email sending operation at once */

massMailer.prototype.invokeOperation = function() {
	var self = this;
	async.each(listofemails,self.SendEmail,function(){
		console.log(success_email);
		console.log(failure_email);
	});
}

/* 
* This function will be called by multiple instance.
* Each instance will contain one email ID
* After successfull email operation, it will be pushed in failed or success array.
*/

massMailer.prototype.SendEmail = function(Email,callback) {
	console.log("Sending email to " + Email);
	var self = this;
	self.status = false;
	// waterfall will go one after another
	// So first email will be sent
	// Callback will jump us to next function
	// in that we will update DB
	// Once done that instance is done.
	// Once every instance is done final callback will be called.
	async.waterfall([
		function(callback) {				
			var mailOptions = {
				from: 'shahid@codeforgeek.com',		
				to: Email,
				subject: 'Hi ! This is from Async Script', 
				text: "Hello World !"
			};
			transporter.sendMail(mailOptions, function(error, info) {				
				if(error) {
					console.log(error)
					failure_email.push(Email);
				} else {
					self.status = true;
					success_email.push(Email);
				}
				callback(null,self.status,Email);
			});
		},
		function(statusCode,Email,callback) {
				console.log("Will update DB here for " + Email + "With " + statusCode);
				callback();
		}
		],function(){
			//When everything is done return back to caller.
			callback();
	});
}

new massMailer(); //lets begin
