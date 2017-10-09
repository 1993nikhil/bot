var express = require('express')
var request = require('request')
var fbService = require('../services/greetingService')
var fb_api = require('../routes/fbapi')
var utilMsg = require('../utils/messages')
var util = require('../utils/utils')
var index = 0;

var token = "EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"

function receivedMessage(event) {
	var senderID = event.sender.id;
    var pageId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    fbService.checkUser(senderID).then(function(resp){
      if(resp){
        messageText = messageText.toLowerCase();
        if(messageText==hi||messageText=='hello'){
          getUserName(senderID);
          fbService.updateQuestionIndex(senderID,1);
        }
        else{
          index = resp.questionIndex + 1;
          sendTextMessage(senderID,'thanks for response');
          console.log(index);
          nextQuestion(index,messageText,senderID);
        }
      }
      else{
        getUserName(senderID);
        fbService.saveUser(userId);
      }
    });
    
}

function receivedPostback(messagingEvent){

  var senderID = messagingEvent.sender.id;
  var pageId = messagingEvent.recipient.id;
  var timeOfMessage = messagingEvent.timestamp;
  var message = messagingEvent.postback.payload;
  
  // index = index+1;
  if(message =='get started'){

    fbService.checkUser(senderID).then(function(resp){
      if(resp){
          getUserName(senderID);
          fbService.updateQuestionIndex(senderID,1);
          console.log(resp);
      }
      else{
        getUserName(senderID);
        fbService.saveUser(userId);
      }
    });
    
  }

  if(message =='1-NP'){
    nextQuestion(2,message,senderID);
  }
  else if(message =='1-PS'){
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
  else{
    //Send message for garbage value
  }

  

}

function getUserName(userId) {
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token;

 request({
    uri: getInfoUserAPI,
    method: 'GET',   

  }, function (error, response, body) {
 
    if (!error && response.statusCode == 200) {
     var jsonData = JSON.parse(body);
     var welcomeMessage = utilMsg.messages.greeting;
     var result = welcomeMessage.replace("#userName#",jsonData.first_name+" "+jsonData.last_name);
  
     
      startConversation(userId, result);
      setTimeout(function(){ 
          nextOption(userId, "and");
          
        }, 500);
     }
      else {
      console.error("Unable to send message1.");
      console.error(response);
      console.error(error);
    }
  }); 


}

function startConversation(userId, messageText){
          var messageData = {
          recipient: {
            id: userId
          },
          message: {
            attachment: {
                type: "template",
                payload:  {
                template_type: "button",
                text: messageText,
                  buttons: [{
                    type: "postback",
                    title: "Next Due Date",
                    payload: "1-NP",
                  },
                  {
                    type: "postback",
                    title: "Policy Status",
                    payload: "1-PS"
                  },
                  {
                    type: "postback",
                    title: "Fund Value",
                    payload: "1-FV",
                  }]
              }
            }
          }
      }; 

     callSendAPI(messageData); 
}


function nextOption(userId, messageText){
          var messageData = {
          recipient: {
            id: userId
          },
          message: {
            attachment: {
                type: "template",
                payload:  {
                template_type: "button",
                text: messageText,
                  buttons: [{
                    type: "postback",
                    title: "Pay Premium",
                    payload: "1-PP",
                  },
                  {
                    type: "postback",
                    title: "Total Amt. Paid",
                    payload: "1-TAP"
                  },
                  {
                    type: "postback",
                    title: "Renewal Payment Received or Not",
                    payload: "1-RP",
                  }]
              }
            }
          }
      }; 
  callSendAPI(messageData);

}


//questions
function nextQuestion(questionIndex,payload,recipientId){
  if(questionIndex==2){
    var messageData ={
     recipient: {
           id: recipientId
        },
        message: {
          text: "Please provide me with your 8 digit policy number"
        }      
    }
    fbService.updateQuestionIndex(recipientId,questionIndex);

    callSendAPI(messageData);
  }
  else if(questionIndex==3){
    if(util.validatePolicyNumber(payload)){
      fbService.updateQuestionIndex(recipientId,questionIndex);
      var messageData ={
      recipient: {
            id: recipientId
         },
         message: {
           text: "Please provide me with your DOB in DD-MM-YYYY format"
         }      
      }  

      callSendAPI(messageData);       
    }else {
      var messageData ={
      recipient: {
            id: recipientId
          },
      message: {
          text: "Provide valid policy Number"
        }      
      }  
      callSendAPI(messageData); 
    }
  }
  else if(questionIndex==4){
    
    if(util.validateDOB(payload)){
      fbService.updateQuestionIndex(recipientId,questionIndex);
      var messageData ={
      recipient: {
           id: recipientId
        },
        message: {
          text: "OTP is send to your register no. please provide that"
        }      
      }  

      callSendAPI(messageData);     
    }else{
     var messageData ={
     recipient: {
           id: recipientId
        },
        message: {
          text: "Please provide valid DOB in DD-MM-YYYY format"
        }      
      }  
      callSendAPI(messageData); 
    }
    
  }
}



//send message
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
	receivedPostback:receivedPostback
};