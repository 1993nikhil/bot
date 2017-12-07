var config = {
    token: "EAAXOoe2ERoQBAE0pZCjLD6bwC9ustHXZCbsg2UZB13Li2I5GA8dZCN41hKQxt3v5snu6nXPlblLrG2g4yT9Fh6ZApAeoUJFQv0nhq0MAzxzZCnhw5cSVZBZBlf57RkkcjeIeCcpWn2sCQISHMyX5ZAO0h0UMtFilZB2jKpHZCNVWsXPGCA0ZBjadve6y",
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
//   token:"EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"
// }