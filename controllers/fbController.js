var express = require('express')
var request = require('request')
var fbService = require('../services/greetingService')
var fb_api = require('../routes/fbapi')




function receivedMessage(event) {
	var senderID = event.sender.id;
    var pageId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;
    
     if (messageText) {
      messageText= messageText.toLowerCase();
      switch (messageText) {
        case 'generic':
        sendTextMessage(senderID, "Thank You for your Response, have a nice Day");
        break;
        case 'hi':
        fbService.getUserName(senderID, 1);
        break;
        case 'hello':
        fbService.getUserName(senderID);
        break;
        
            
        default:
        sendTextMessage(senderID, "Thank You for your Response, have a nice Day");
      }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }  

}

function receivedPostback(messagingEvent){

  var senderID = messagingEvent.sender.id;
  var pageId = messagingEvent.recipient.id;
  var timeOfMessage = messagingEvent.timestamp;
  var message = messagingEvent.postback.payload;
  messageText = "Processing your request...";
  sendTextMessage(senderID, pageId, messageText)

}


function sendTextMessage(sender, messageText) {
	var messageData = {
		 recipient: {
           id: sender
        },
        message: {
          text: messageText
        }
    };

    fb_api.callSendAPI(messageData);
}

module.exports = {
	receivedMessage:receivedMessage,
	sendTextMessage:sendTextMessage,
	receivedPostback:receivedPostback
};