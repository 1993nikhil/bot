var express = require('express')
var request = require('request')
var fb_ctrl = require('../controllers/fbController')

var token = "EAAcrdFtPXuEBAE3Ct3os2aMLc9ZBVgL1ZAUU1bFN3GJMn1I26kDht9U6OZAOZBJ4O5JWqe4vmZCFqp5HMoe3EZBPJeodrVoghvmI1oaxzwRavu2zT0oQPO1D6sO6k4VylxYqwzknEKhn5ehZCUs2sQ33HrFAiCtLE5zh5i8HFcUfgZDZD"


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


module.exports = {
	//callSendAPI:callSendAPI,
	facebookWebhookListener:facebookWebhookListener,
    token:token
};