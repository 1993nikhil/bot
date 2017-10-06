var express = require('express')
var request = require('request')
var fbCtrl = require('../controllers/fbController')
var fb_api = require('../routes/fbapi')

var token = "EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"

function getUserName(userId, isHi) {
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token;

 request({
    uri: getInfoUserAPI,
    method: 'GET',   

  }, function (error, response, body) {
 
    if (!error && response.statusCode == 200) {
     var jsonData = JSON.parse(body);
     var newMessage = "Hi "+jsonData.first_name+" "+jsonData.last_name+" . I am riya , welcome to DHFL Bot. I can help you with the following services";
     
     if(isHi){
        startConversationQ(userId, newMessage);
     }else{
        fbCtrl.sendTextMessage(userId, newMessage);
        setTimeout(function(){ 
          startConversation(userId, newMessage);
          
        }, 1000);
     }
     

    } else {
      console.error("Unable to send message1.");
      console.error(response);
      console.error(error);
    }
  }); 


}

//quick link test
function startConversationQ(userId, messageText){
    var messageData = {
    recipient: {
      id:userId
    },
   message: {
          text: messageText,
          quick_replies:[
              {
                content_type:"text",
                title:"Renewal payment received or not",
                payload:"1-RPR",
              },
              {
                content_type:"text",
                title:"Policy Status",
                payload:"1-PS",

              },
              {
                content_type:"text",
                title:"Fund value as on date",
                payload:"1-FV",
              },
              {
                content_type:"text",
                title:"Amount Deposited in Policy Till Date",
                payload:"1-AD",
              },
              {
                content_type:"text",
                title:"Pay Renewal Payment",
                payload:"1-PRP",
              },
              {
                content_type:"text",
                title:"Next Premium Due Date",
                payload:"1-NP",
              }
            ]
        } 
      };

  fbCtrl.callSendAPI(messageData);
}

function startConversation(userId, messageText){
    var messageData = {
    recipient: {
      id:userId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Renewal payment received or not",
            buttons: [{
              type: "postback",
              title: "start",
              payload: "1-RPR",
            }]
          }, {
            title: "Policy Status(Active/Lapsed/revived etc.)",
            buttons: [{
              type: "postback",
              title: "start",
              payload: "1-PS",
            }]
          }, {
            title: "Fund value as on date",
            buttons: [{
              type: "postback",
              title: "start",
              payload: "1-FV",
            }]
          }, {
            title: "Amount Deposited in Policy Till Date",
            buttons: [{
              type: "postback",
              title: "start",
              payload: "1-AD",
            }]
          }, {
            title: "Pay Renewal Payment",
            buttons: [{
              type: "postback",
              title: "start",
              payload: "1-PRP",
            }]
          }, {
            title: "Next Premium Due Date",
            buttons: [{
             type: "postback",
             title: "start",
             payload: "1-NP",
            }]
          }]
        }
      }          
          
        }
    };


  fbCtrl.callSendAPI(messageData);
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
   startConversation:startConversation,
   startConversationQ:startConversationQ
};

