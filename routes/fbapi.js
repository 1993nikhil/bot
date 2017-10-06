var express = require('express')
var request = require('request')
var fb_ctrl = require('../controllers/fbController')

var token = "EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"


function facebookWebhookListener(req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        pageId = event.recipient.id
        if (event.message) {
        	fb_ctrl.receivedMessage(event);
		}
        else if (event.postback) {
            fb_ctrl.receivedPostback(event);
        }
    }
    res.sendStatus(200);
}


// function callSendAPI(messageData) {
//   request({
//     uri: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: {access_token: token},
//     method: 'POST',
//     json: messageData

//   }, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var recipientId = body.recipient_id;
//       var messageId = body.message_id;

//       console.log("Successfully sent generic message with id %s to recipient %s", 
//         messageId, recipientId);
//     } else {
//       console.error("Unable to send message.");
//       //console.error(response);
//       console.error(error);
//     }
//   });  
// }

module.exports = {
	//callSendAPI:callSendAPI,
	facebookWebhookListener:facebookWebhookListener
};