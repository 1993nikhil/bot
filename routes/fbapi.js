var express = require('express')
var request = require('request')
var fb_ctrl = require('../controllers/fbController')

var token = "EAAXOoe2ERoQBAE0pZCjLD6bwC9ustHXZCbsg2UZB13Li2I5GA8dZCN41hKQxt3v5snu6nXPlblLrG2g4yT9Fh6ZApAeoUJFQv0nhq0MAzxzZCnhw5cSVZBZBlf57RkkcjeIeCcpWn2sCQISHMyX5ZAO0h0UMtFilZB2jKpHZCNVWsXPGCA0ZBjadve6y"


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