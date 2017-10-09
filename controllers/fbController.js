var express = require('express')
var request = require('request')
var fbService = require('../services/greetingService')
var fb_api = require('../routes/fbapi')
var Log = require('../models/logModel')
var saveUserOffset = 0;
var index = 0;
var usr = {};

var token = "EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"

function receivedMessage(event) {
	var senderID = event.sender.id;
    var pageId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;
    index = index + 1;
    // Log.findOne({recipientID:senderID}, function(err, data){
    //   if(err) {
    //     console.log(err);
    //   }
    //   else{
    //     console.log(data);
    //     index = data.questionIndex;
    //   }
    // });
    messageText= messageText.toLowerCase();
    if(messageText=='hi'||messageText=='hello'){
      index = 1;
      fbService.getUserName(senderID, 1);
    }
    else if(index==6){
     fbService.nextQuestion(3,messageText,senderID);
     }
     else if(index==8){
      fbService.nextQuestion(4,messageText,senderID);
     }
    else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
     } 
     else {
      sendTextMessage(senderID, "Thank You for your Response, have a nice Day");
     }
     console.log(index+'hi');

    if(!saveUserOffset){
    	saveUser(senderID);
    }


}

function receivedPostback(messagingEvent){

  var senderID = messagingEvent.sender.id;
  var pageId = messagingEvent.recipient.id;
  var timeOfMessage = messagingEvent.timestamp;
  var message = messagingEvent.postback.payload;
  messageText = "Processing your request...";
  
  index = index+1;

  if(message=='1-NP'){
    fbService.nextQuestion(2,message,senderID);
  }
  else if(message=='1-PS'){
    sendTextMessage(senderID, "Policy Status");
  }
  else if(message=='1-FV'){
    sendTextMessage(senderID, "Fund Value");
  }
  else if(message=='1-PP'){
    sendTextMessage(senderID, "Pay Premium");
  }
  else if(message=='1-TAP'){
    sendTextMessage(senderID, "Total Amt. Paid");
  }
  else if(message=='1-RP'){
    sendTextMessage(senderID, "Renewal Payment Received or Not");
  }

  

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

    callSendAPI(messageData);
}


function saveUser(userId){
	var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token;
	saveUserOffset = 1;
	request({
	   uri: getInfoUserAPI,
       method: 'GET',   

	}, function (error, response, body) {

		if (!error && response.statusCode == 200) {
			var jsonData = JSON.parse(body);
			var user = {
				recipientId: userId,
				userName: jsonData.first_name,
        questionIndex: 1
			}

			var userDetail = new Log(user)
      Log.findOne({recipientID:userId}, function(err, user){
        if(user){
          //user exists
          console.log('user exist');
        }else{
         userDetail.save(function(err){
         if(err){
         console.log(err);
         }
            console.log('new user saved ');
          });

        }
      })

		}else{
		  console.error("Unable to send message1.");
          console.error(response);
          console.error(error);	
		}

	});
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      //console.error(response);
      console.error(error);
    }
  });  
}

module.exports = {
	receivedMessage:receivedMessage,
	sendTextMessage:sendTextMessage,
	receivedPostback:receivedPostback
};