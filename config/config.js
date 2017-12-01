var config = {
	 token:"EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD",
}



var nodemailer = require("nodemailer");
 var smtpConfig = {
     host: '202.162.242.233',
     port: 25
 };



 config.mailer = {
    transporter: nodemailer.createTransport('direct:?name=' + smtpConfig.host + ':' + smtpConfig.port),
   // transporter:transporter,
    sendMail: function(mailOptions) {
        mailOptions.from = '"AceApp" <aceapp@dhflpramerica.com>';
        //console.log(mailOptions);
        config.mailer.transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
            	console.log('Error');
                console.log(error);
                return error;
            }
            console.log('Message sent successfully');
             console.log(info);
            return info;

        });
    }
}

module.exports = config;

// module.exports = {
// 	 token:"EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"
// }
