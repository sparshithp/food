/**
 * http://usejsdoc.org/
 */
var emaiConfig = require('../../email-config');
var nodemailer = require('nodemailer');

exports.sendEmail = function(emailId, sub, body){
	
	var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: emaiConfig.COMPANY_EMAIL,
            pass: emaiConfig.COMPANY_EMAIL_PASSWORD
        }
    });
	
	var mailOptions = {
		    from: emaiConfig.COMPANY_EMAIL, 
		    to: emailId,
		    subject: sub,
		    text: body 
		   
		};
	
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.log(error);
	    }else{
	        console.log('Message sent: ' + info.response);
	    };
	});
}
