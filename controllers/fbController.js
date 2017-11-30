var express = require('express');
var request = require('request');
var fbService = require('../services/fbService');
var fb_api = require('../routes/fbapi');
var utilMsg = require('../utils/messages');
var util = require('../utils/utils');
var conf = require('../config/config');
var policyDetail = require('../utils/policyData');
var Q = require('q');
var moment = require('moment');
var sha1 = require('sha1');
var index = 0;
var policyDetailNum = '';
var policyDOB = false;

function receivedMessage(event) {
	var senderID = event.sender.id;
    var pageId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;
    if(messageText==undefined){
      return false;
    }else{
      messageText = messageText.toLowerCase();
    }
    
    if(messageText=='hi'||messageText=='hello'||messageText=='new'){
      fbService.checkUser(senderID).then(function(resp){
      if(resp){
          getUserName(senderID,timeOfMessage);
          fbService.updateQuestionIndex(senderID,"0-null-null");
      }
      else{
        getUserName(senderID,timeOfMessage);
        fbService.saveUser(senderID);
      }
    });      
    }else if(messageText=='cancel'){
      nextQuestion("6-null-null",messageText,senderID,timeOfMessage);
    }else{
    fbService.checkUser(senderID).then(function(resp){
      if(resp){
        var newQuestionIndex = resp.questionIndex;
        var indArray = resp.questionIndex.split("-");
        var index = parseInt(indArray[0])+1;
        if(index==5){
          if(messageText=='resend'){
            resendOTP(senderID,timeOfMessage);
          }else{
            verifyOTP(senderID,messageText,timeOfMessage,newQuestionIndex);
          }
          
        }else if(index==1 || index == 8){
            sendTextMessage(senderID,"You can type \"cancel\" at any point in time to exit conversation or type \"New\" to start new conversation");
        }else {
          nextQuestion(newQuestionIndex,messageText,senderID,timeOfMessage);
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
          getUserName(senderID,timeOfMessage);
          fbService.updateQuestionIndex(senderID,'0-null-null');
      }
      else{
        getUserName(senderID,timeOfMessage);
        fbService.saveUser(senderID);
      }
    });
    
  }

  if(message =='0-NP-null'){
    nextQuestion("1-NP-PolicyID",message,senderID,timeOfMessage);
  }
  else if(message =='0-PS-null'){
    nextQuestion("1-PS-PolicyID",message,senderID,timeOfMessage);
  }
  else if(message=='0-FV-null'){
    nextQuestion("1-FV-PolicyID",message,senderID,timeOfMessage);
  }
  else if(message=='0-PP-null'){
    nextQuestion("1-PP-PolicyID",message,senderID,timeOfMessage);
  }
  else if(message=='0-TAP-null'){
    nextQuestion("1-TAP-PolicyID",message,senderID,timeOfMessage);
  }
  else{
    //Send message for garbage value
  }

  

}

function getUserName(userId,timeOfMessage) {
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+conf.token;

 request({
    uri: getInfoUserAPI,
    method: 'GET',   

  }, function (error, response, body) {
 
    if (!error && response.statusCode == 200) {
     var jsonData = JSON.parse(body);
     var welcomeMessage = utilMsg.messages.greeting;
     //console.log('jsonData',jsonData);
     jsonData.first_name = jsonData.first_name||'';
     jsonData.last_name = jsonData.last_name||'';
     var result = welcomeMessage.replace("#userName#",jsonData.first_name+" "+jsonData.last_name);
     var currentDate = moment(timeOfMessage).add(6,'hours').subtract(30,'minutes');
     var hours = currentDate.hours();
     if( hours< 12){
       result = result.replace("#greet#","Good morning");
     }
     else if( hours >= 12 && hours < 17 ){
       result = result.replace("#greet#","Good afternoon");
     }
     else if( hours >= 17 && hours <= 24 ){
       result = result.replace("#greet#","Good evening");
     }
    sendTextMessage(userId, result).then(setTimeout(function(res){ 
          startConversation(userId, utilMsg.messages.buttonMessage).then(setTimeout(function(resp){ 
          nextOption(userId, "...").then(setTimeout(function(resp){ 
          sendTextMessage(userId, "You can type \"cancel\" at any point in time to exit conversation or type \"New\" to start new conversation");
          
        }, 800));
          
        }, 800));
          
        }, 800));

      }
      else {
      console.error("Unable to send message1.");
      console.error(response);
      console.error(error);
    }
  }); 


}

function startConversation(userId, messageText){
          var deferred=Q.defer();
          var messageData = {
          recipient: {
            id: userId
          },
          message: {
               attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: [{
                    title: messageText,
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
                          }],
                  }]
                }
            }
          }
      }; 
     deferred.resolve(messageData);
     callSendAPI(messageData); 
     return deferred.promise;
}


function nextOption(userId, messageText){
          var deferred=Q.defer();

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
                  }]
              }
            }
          }
      }; 
     deferred.resolve(messageData);
     callSendAPI(messageData); 
     return deferred.promise;

}


//questions
function nextQuestion(questionIndex,payload,recipientId,timeOfMessage){
  var indexArray = questionIndex.split("-");
  var qIndex = parseInt(indexArray[0])+1;
  if(qIndex==2){
    var messageData ={
     recipient: {
           id: recipientId
        },
        message: {
          text: "Please provide your 8 digit policy number"
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
           text: "Please provide your DOB in DD-MM-YYYY format"
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
          text: "Please enter OTP received on your registered mobile number to validate . If you don't receive an OTP in next 1 minute please enter RESEND"
        }      
      }  
      fbService.saveResponse(recipientId,newQuestionIndex,payload).then(function(data){
        fbService.getPolicyData(recipientId,indexArray[1]).then(function(resp){
        var validatePolicyResult = util.validatePolicy(resp);
        if(validatePolicyResult!=null){
          policyDetailNum = validatePolicyResult.mobile;
          fbService.getVerification(recipientId,validatePolicyResult.PolicyNo).then(function(exist){
             if(exist){
                var newQIndex = "4-"+indexArray[1]+"-OTP";
                nextQuestion(newQIndex,"verified",recipientId);
             }
             else{
               generateOtp(recipientId,validatePolicyResult.mobile,timeOfMessage).then(setTimeout(function(res){
                 callSendAPI(messageData);
                 fbService.saveVerification(recipientId,validatePolicyResult.PolicyNo);
          
               }, 500));
             }
          });
          
        }else{
          sendTextMessage(recipientId,'Policy Details not matched \nplease provide your 8 digit policy number');
          var newQuestionIndex = "2-"+indexArray[1]+"-policyID";
          fbService.updateQuestionIndex(recipientId,newQuestionIndex);
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
          policyStatusData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='FV'){
          fundValueData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='PP') {
          payPremium(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='TAP') {
          totalAmtPaidData(recipientId,indexArray[1]);
        }
        else if(indexArray[i]=='RP') {
          nextDueData(recipientId,indexArray[1]);
        }                                
     
      }else if(payload=="not verified"){
          var messageData ={
            recipient: {
              id: recipientId
            },
            message: {
              text: "OTP not verified . Please provide OTP send to your registered mobile"
            }
          }
          callSendAPI(messageData);  
      }else if(payload=="time out"){
          var messageData ={
            recipient: {
              id: recipientId
            },
            message: {
              text: "Timed out .\nPlease provide your 8 digit policy no. number"
            } 
          }
          var newQuestionIndex = "2-"+indexArray[1]+"-policyID";
          fbService.updateQuestionIndex(recipientId,newQuestionIndex);          
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
          text: "Can I help you with something else(Yes\\No)"
        }
      }
      callSendAPI(messageData);            
  }
  else if(qIndex==7){
    if(payload=='yes' || payload=='y'){
      startConversation(recipientId,utilMsg.messages.buttonMessage).then(setTimeout(function(resp){ 
          nextOption(recipientId,"...");
          
        }, 800));
      fbService.updateQuestionIndex(recipientId,"0-null-null");     

    }
    else if(payload=='no' || payload=='n' || payload=='cancel'){
      var newQuestionIndex = "7-"+indexArray[1]+"-COMP";
      fbService.updateQuestionIndex(recipientId,newQuestionIndex);
      var thanksText =  utilMsg.messages.thankyouMessage;
      var queryText =  utilMsg.messages.queryMessage;
      sendTextMessage(recipientId,thanksText).then(setTimeout(function(resp){ 
          sendTextMessage(recipientId, queryText);
          
        }, 800));
      // setTimeout(function(){ 
      //   sendTextMessage(recipientId, queryText);
          
      // }, 500);  
    }
    else {
      var newQuestionIndex = "6-"+indexArray[1]+"-RES";
      fbService.updateQuestionIndex(recipientId,newQuestionIndex);
      var messageData ={
      recipient: {
          id: recipientId
        },
        message: {
          text: "Please reply (yes\\no)"
        }
      }
      callSendAPI(messageData);       
    }
  }
}

//next payment due date service
function nextDueData(recipientId,category){
  fbService.getPolicyById(recipientId,category).then(function(resp){
   var nextDueMsg = utilMsg.messages.nextDueMessage;
   var messageData = nextDueMsg.replace("#policyid#",resp);

   sendTextMessage(recipientId,messageData).then(setTimeout(function(resp){
          var newQuestion = "5-"+category+"-DATA"; 
          nextQuestion(newQuestion,"next", recipientId,1);
          
        }, 800));
   // setTimeout(function(){ 
   //    nextQuestion("5-NP-DATA","next", recipientId);
          
   //  }, 500); 
 });
}  

//fund value service
function fundValueData(recipientId,category){
  fbService.getPolicyById(recipientId,category).then(function(resp){
   var fundVAlueMsg = utilMsg.messages.fundValueMessage;
   var messageData = fundVAlueMsg.replace("#policyid#",resp);

   sendTextMessage(recipientId,messageData).then(setTimeout(function(resp){
          var newQuestion = "5-"+category+"-DATA"; 
          nextQuestion(newQuestion,"next", recipientId,1);
          
        }, 800));
 
 });  
}

//total amount paid service
function totalAmtPaidData(recipientId,category){
  fbService.getPolicyById(recipientId,category).then(function(resp){
   var tapMsg = utilMsg.messages.totalAmtMessage;
   var messageData = tapMsg.replace("#policyid#",resp);

   sendTextMessage(recipientId,messageData).then(setTimeout(function(resp){
          var newQuestion = "5-"+category+"-DATA"; 
          nextQuestion(newQuestion,"next", recipientId,1);
          
        }, 800));
 
 });    
}

//policy status service
function policyStatusData(recipientId,category){
   fbService.getPolicyById(recipientId,category).then(function(resp){
    var polMsg = '';
    if(resp=='12345678'){
      polMsg = 'Surrender';
    }
    else if(resp=='10101010'){
      polMsg = 'Lapse';
    }
    else{
      polMsg = 'Premium Paying';
    }
   var msg = utilMsg.messages.policyStatusMessage;
   var messageData = msg.replace("#policyid#",resp);
   var messageData = msg.replace("policyStat",polMsg);

   sendTextMessage(recipientId,messageData).then(setTimeout(function(resp){
          var newQuestion = "5-"+category+"-DATA"; 
          nextQuestion(newQuestion,"next", recipientId,1);
          
        }, 800));
 
 });  
}

//pay premium service
function payPremium(recipientId,category){
     fbService.getPolicyById(recipientId,category).then(function(resp){
   var messageData = utilMsg.messages.payPremiumMessage;
   
   sendPayPremiumMessage(recipientId,messageData).then(setTimeout(function(resp){
          var newQuestion = "5-"+category+"-DATA"; 
          nextQuestion(newQuestion,"next", recipientId,1);
          
        }, 800));
 
 }); 
}

function generateOtp(recipientId,mobileNo,timeOfMessage){
  var deferred=Q.defer();
  var min = 100000;
  var max = 999999;
  var otp = Math.floor(Math.random() * (max - min + 1)) + min;
  deferred.resolve(otp);
  fbService.saveOtp(recipientId,otp,mobileNo,timeOfMessage);
  return deferred.promise;
}


//resend otp
function resendOTP(recipientId,timeOfMessage){
  fbService.getOtp(recipientId,policyDetailNum).then(function(res){
      fbService.saveOtp(recipientId,res.otp,res.mobileNo,timeOfMessage);
      sendTextMessage(recipientId,'OTP has been Successfully resend to your registered number.');
  });
  // generateOtp(recipientId,policyDetail.policy.mobile,timeOfMessage).then(function(resp){
  //   sendTextMessage(recipientId,'OTP has been Successfully resend to your registered number.');
  // });
}

function verifyOTP(recipientId,payload,otpTime,questionIndex){
  fbService.getOtp(recipientId,policyDetailNum).then(function(resp){
    
    if(otpTime<resp.expireTime){
      // var otpNum = parseInt(payload);
      // var hashOtp = sha1(otpNum);
      if(resp.otp === payload){
        nextQuestion(questionIndex,"verified",recipientId);
      }
      else{
        nextQuestion(questionIndex,"not verified",recipientId);
      }      
    }else{
      nextQuestion(questionIndex,"time out",recipientId);
    }
  });

}

//send message
function sendTextMessage(sender, messageText) {
  var deferred=Q.defer();
  var messageData = {
     recipient: {
           id: sender
        },
        message: {
          text: messageText
        }
    };
    deferred.resolve(messageData);
    callSendAPI(messageData);
    return deferred.promise;
}

//send premium message
function sendPayPremiumMessage(sender, messageText){
    var deferred=Q.defer();
    var messageData = {
     recipient: {
           id: sender
        },
        message: {
            attachment: {
                type: "template",
                payload:  {
                template_type: "button",
                text: messageText,
                  buttons: [{
                    type: "web_url",
                    title: "Click to Pay",
                    url: "https://www.dhflpramerica.com/PolicyPaymentLogin#pnlView",
                  }]
                }  
            }
        }
    };
    deferred.resolve(messageData);
    callSendAPI(messageData);
    return deferred.promise;
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