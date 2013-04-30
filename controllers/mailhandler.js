var nodemailer = require('nodemailer')
	,transportOption = require('../config').getMailCredential();
var smtpTransport = nodemailer.createTransport("SMTP", transportOption);

exports.sendMail = function(mailOptions, callback){
	mailOptions.from = (mailOptions.from || 'royingantaginting@gmail.com');
	mailOptions.subject = (mailOptions.subject || 'Bingo Game Invitation');
	
	smtpTransport.sendMail(mailOptions, callback);
}
