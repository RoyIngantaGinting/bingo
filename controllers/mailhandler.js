var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "",
        pass: ""
    }
});

exports.sendMail = function(mailOptions, callback){
	mailOptions.from = (mailOptions.from || 'royingantaginting@gmail.com');
	mailOptions.subject = (mailOptions.subject || 'Bingo Game Invitation');
	
	smtpTransport.sendMail(mailOptions, callback);
}
