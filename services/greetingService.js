var express = require('express')
var request = require('request')
var fbCtrl = require('../controllers/fbController')
var fb_api = require('../routes/fbapi')

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
                    title: "Renewal Payment",
                    payload: "1-RP",
                  }]
              }
            }
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
   getUserName:getUserName,
   nextOption:nextOption,
   startConversation:startConversation
};

