var express = require('express')
var request = require('request')
var fbService = require('../services/greetingService')
var fb_api = require('../routes/fbapi')
var utilMsg = require('../utils/messages')
var util = require('../utils/utils')
var conf = require('../config/config')
var index = 0;
var policyNo = false;
var policyDOB = false;

function receivedMessage(event) {
	var senderID = event.sender.id;
    var pageId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;
    messageText = messageText.toLowerCase();
    if(messageText=='hi'||messageText=='hello'){
      fbService.checkUser(senderID).then(function(resp){
      if(resp){
          getUserName(senderID);
          fbService.updateQuestionIndex(senderID,"0-null-null");
      }
      else{
        getUserName(senderID);
        fbService.saveUser(senderID);
      }
    });      
  }else{
    fbService.checkUser(senderID).then(function(resp){
      if(resp){
        var newQuestionIndex = resp.questionIndex;
        var indArray = resp.questionIndex.split("-");
        var index = parseInt(indArray[0])+1;
        if(index==5){
          verifyOTP(senderID,messageText,timeOfMessage,newQuestionIndex);
        }else{
          nextQuestion(newQuestionIndex,messageText,senderID);
        }          
        
      }
      else{
        getUserName(senderID);
        fbService.saveUser(senderID);
      }
    });

  }

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
          fbService.updateQuestionIndex(senderID,'0-null-null');
      }
      else{
        getUserName(senderID);
        fbService.saveUser(senderID);
      }
    });
    
  }

  if(message =='0-NP-null'){
    nextQuestion("1-NP-PolicyID",message,senderID);
  }
  else if(message =='0-PS-null'){
    nextQuestion("1-PS-PolicyID",message,senderID);
  }
  else if(message=='0-FV-null'){
    nextQuestion("1-FV-PolicyID",message,senderID);
  }
  else if(message=='0-PP-null'){
    nextQuestion("1-PP-PolicyID",message,senderID);
  }
  else if(message=='0-TAP-null'){
    nextQuestion("1-TAP-PolicyID",message,senderID);
  }
  else if(message=='0-RP-null'){
    nextQuestion("1-RP-PolicyID",message,senderID);
  }
  else{
    //Send message for garbage value
  }

  

}

function getUserName(userId) {
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+conf.token;

 request({
    uri: getInfoUserAPI,
    method: 'GET',   

  }, function (error, response, body) {
 
    if (!error && response.statusCode == 200) {
     var jsonData = JSON.parse(body);
     var welcomeMessage = utilMsg.messages.greeting;
     var result = welcomeMessage.replace("#userName#",jsonData.first_name+" "+jsonData.last_name);
  
     
      startConversation(userId, result).then(nextOption(userId,"..."));
     //  setTimeout(function(){ 
     //      nextOption(userId, "...");
          
     //    }, 800);
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
                    payload: "0-NP-null",
                  },
                  {
                    type: "postback",
                    title: "Policy Status",
                    payload: "0-PS-null"
                  },
                  {
                    type: "postback",
                    title: "Fund Value",
                    payload: "0-FV-null",
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
                    payload: "0-PP-null",
                  },
                  {
                    type: "postback",
                    title: "Total Amt. Paid",
                    payload: "0-TAP-null"
                  },
                  {
                    type: "postback",
                    title: "Renewal Payment Received or Not",
                    payload: "0-RP-null",
                  }]
              }
            }
          }
      }; 
  callSendAPI(messageData);

}


//questions
function nextQuestion(questionIndex,payload,recipientId){
  var indexArray = questionIndex.split("-");
  var qIndex = parseInt(indexArray[0])+1;
  if(qIndex==2){
    var messageData ={
     recipient: {
           id: recipientId
        },
        message: {
          text: "Please provide me with your 8 digit policy number"
        }      
    }
    var newQuestionIndex = "2-"+indexArray[1]+"-"+indexArray[2];
    fbService.updateQuestionIndex(recipientId,newQuestionIndex);

    callSendAPI(messageData);
  }
  else if(qIndex==3){
    if(util.validatePolicyNumber(payload)){
      var newQuestionIndex = "3-"+indexArray[1]+"-DOB";
      fbService.updateQuestionIndex(recipientId,newQuestionIndex);
      fbService.saveResponse(recipientId,newQuestionIndex,payload);
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
  else if(qIndex==4){
    
    if(util.validateDOB(payload)){
      var newQuestionIndex = "4-"+indexArray[1]+"-OTP";
      fbService.updateQuestionIndex(recipientId,newQuestionIndex);;
      var messageData ={
      recipient: {
           id: recipientId
        },
        message: {
          text: "OTP is send to your register no. please provide that"
        }      
      }  
      fbService.saveResponse(recipientId,newQuestionIndex,payload).then(function(data){
        fbService.getPolicyData(recipientId,indexArray[1]).then(function(resp){
        if(util.validatePolicy(resp)){
          generateOtp(recipientId);
          callSendAPI(messageData);
        }else{
          sendTextMessage(recipientId,'Policy Details not matched please type Hi/Hello to start your journey again');
          fbService.updateQuestionIndex(recipientId,"0-null-null");
        }
      });
      });
     
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
  else if(qIndex==5){
      if(payload=="verified"){
        var newQuestionIndex = "5-"+indexArray[1]+"-VOTP";
        fbService.updateQuestionIndex(recipientId,newQuestionIndex);
        if(indexArray[i]=='NP'){
          nextDueData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='PS'){
          nextDueData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='FV'){
          nextDueData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='PP') {
          nextDueData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='TAP') {
          nextDueData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='RP') {
          nextDueData(recipientId,indexArray[1]);
        }                                
     
      }else{
          var messageData ={
            recipient: {
              id: recipientId
            },
            message: {
              text: "otp not verified . please provide otp send to your registered mobile"
            }
          }
          callSendAPI(messageData);  
      }        
    
  }
  else if(qIndex==6){
      var newQuestionIndex = "6-"+indexArray[1]+"-RES";
      fbService.updateQuestionIndex(recipientId,newQuestionIndex);
      var messageData ={
        recipient: {
          id: recipientId
        },
        message: {
          text: "Can I help you with something else."
        }
      }
      callSendAPI(messageData);            
  }
  else if(qIndex==7){
    if(payload=='y'||payload=='yes'){
      getUserName(recipientId);
      fbService.updateQuestionIndex(recipientId,"0-null-null");     

    }
    else{
      var newQuestionIndex = "7-"+indexArray[1]+"-COMP";
      fbService.updateQuestionIndex(recipientId,newQuestionIndex);
      var thanksText =  utilMsg.messages.thankyouMessage;
      var queryText =  utilMsg.messages.queryMessage;
      sendTextMessage(recipientId,thanksText);
      setTimeout(function(){ 
        sendTextMessage(recipientId, queryText);
          
      }, 500);  
    }
  }
}

//next payment due date service
function nextDueData(recipientId,category){
  fbService.getPolicyById(recipientId,category).then(function(resp){
   var nextDueMsg = utilMsg.messages.nextDueMessage;
   var messageData = nextDueMsg.replace("#policyid#",resp);

   sendTextMessage(recipientId,messageData);
   setTimeout(function(){ 
      nextQuestion("5-NP-DATA","next", recipientId);
          
    }, 500); 
 });
}  

function generateOtp(recipientId){
  var otp = Math.floor(000001 + Math.random() * 999999);
  fbService.saveOtp(recipientId,otp);
}

function verifyOTP(recipientId,payload,otpTime,questionIndex){
  fbService.getOtp(recipientId).then(function(resp){
    if(resp.otp==payload){
      nextQuestion(questionIndex,"verified",recipientId);
    }
    else{
      nextQuestion(questionIndex,"not verified",recipientId);
    }
  });

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
    qs: {access_token: conf.token},
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