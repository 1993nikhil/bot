var express = require('express')
var request = require('request')
var fbService = require('../services/greetingService')
var fb_api = require('../routes/fbapi')

var token = "EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"

function receivedMessage(event) {
	var senderID = event.sender.id;
    var pageId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    fbService.checkUser(senderID,messageText);

}

function receivedPostback(messagingEvent){

  var senderID = messagingEvent.sender.id;
  var pageId = messagingEvent.recipient.id;
  var timeOfMessage = messagingEvent.timestamp;
  var message = messagingEvent.postback.payload;
  messageText = "Processing your request...";
  
  // index = index+1;
  if(message=='get started'){
    fbService.checkUser(senderID,'hi');
  }

  if(message=='1-NP'){
    fbService.nextQuestion(2,message,senderID);
  }
  else if(message=='1-PS'){
    fbService.sendTextMessage(senderID, "Policy Status");
  }
  else if(message=='1-FV'){
    fbService.sendTextMessage(senderID, "Fund Value");
  }
  else if(message=='1-PP'){
    fbService.sendTextMessage(senderID, "Pay Premium");
  }
  else if(message=='1-TAP'){
    fbService.sendTextMessage(senderID, "Total Amt. Paid");
  }
  else if(message=='1-RP'){
    fbService.sendTextMessage(senderID, "Renewal Payment Received or Not");
  }

  

}




module.exports = {
	receivedMessage:receivedMessage,
	receivedPostback:receivedPostback
};