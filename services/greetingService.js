var express = require('express')
var request = require('request')
var fbCtrl = require('../controllers/fbController')
var fb_api = require('../routes/fbapi')
var Log = require('../models/logModel')


var token = "EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"

function getUserName(userId) {
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token;

 request({
    uri: getInfoUserAPI,
    method: 'GET',   

  }, function (error, response, body) {
 
    if (!error && response.statusCode == 200) {
     var jsonData = JSON.parse(body);
     var newMessage = "Hi "+jsonData.first_name+" "+jsonData.last_name+" . I am Riya , welcome to DHFL Bot. I can help you with the following services";
     
      startConversation(userId, newMessage);
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
    updateQuestionIndex(recipientId,questionIndex);

    callSendAPI(messageData);
  }
  else if(questionIndex==3){
    updateQuestionIndex(recipientId,questionIndex);
  
    validatePolicyNumber(payload, recipientId);
  }
  else if(questionIndex==4){
  updateQuestionIndex(recipientId,questionIndex);
 
    validateDOB(payload,recipientId);
  }

}


function validatePolicyNumber(payload, recipientId){
  var isnum = /^[0-9]{8}/.test(payload);
  if(isnum){
     var messageData ={
     recipient: {
           id: recipientId
        },
        message: {
          text: "Please provide me with your DOB in DD-MM-YYYY format"
        }      
    }  

    callSendAPI(messageData); 
  }
  else{
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

function validateDOB(payload, recipientId){
  var isDOB = /^[0-9]{2}[-|\/]{1}[0-9]{2}[-|\/]{1}[0-9]{4}/.test(payload);
  if(isDOB){
   var messageData ={
     recipient: {
           id: recipientId
        },
        message: {
          text: "OTP is send to your register no. please provide that"
        }      
    }  

    callSendAPI(messageData); 
  }
  else{
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

function updateQuestionIndex(senderID, index){
  var query = {recipientId:senderID};
  var newValue = { $set: { questionIndex: index } };
  Log.updateOne(query, newValue, function(err, res){
    if (err) {
      console.log(err);
    } else{
      console.log("questionIndex updated");
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
   getUserName:getUserName,
   nextOption:nextOption,
   startConversation:startConversation,
   nextQuestion:nextQuestion
};

