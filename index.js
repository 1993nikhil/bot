var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var mongoose = require('mongoose');

app.set('port', (process.env.PORT || 5000))
app.set('mongo_url',('mongodb://heroku_g7rvskm9:kcnrvqiqag5fs9e7b3kpdrdpj1@ds161574.mlab.com:61574/heroku_g7rvskm9'));



mongoose.connect(app.get('mongo_url'),function(err){
  if(err){
    console.log(err);
    process.exit(1);
  }
  console.log("connected to " + app.get('mongo_url'));
});



// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})
//dbtest
//var Log = require('./models/logModel');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
  recipientId: String,
  userName: String,
});

var Log = mongoose.model('Log', logSchema)

var john = Log({
    recipientId: '230',
    userName: 'Nik'
});

//save log
john.save(function(err){
  if(err){
    throw err;
  }
  else{
    console.log('user saved');
  }
})

app.get('/user', function (req, res) {
	Log.find({},{},function(err, data){
		if(err){
			res.send(err);
			console.log("error");
		}
		res.json(data);
	});
})


//var token = "EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD"

var token = {
	492841481078418: 'EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD',
	121736051845888: 'EAABslGNoL6QBAHde5o5OraLFiCOk8L9ydxIJEDaFbZAJvjZCKww6dkihY9YbfU6uB7m45ZBLOwuvMBZCDZBeY7Bzr8rla94tjpXY1iKeSPxT15qzfHmm0VhkJZBq55ZCTQDsraTBGZCUTHk7k6FOskjPrbZBrAgroqhlvWEDmxzgkWAZDZD'
}

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        pageId = event.recipient.id
        if (event.message) {
        	receivedMessage(event);
		}
    else if (event.postback) {
          receivedPostback(event);
        }
    }
    res.sendStatus(200)
})

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
        sendTextMessage(senderID, pageId, "Thank You for your Response, have a nice Day");
        break;
        case 'hi':
        getUserName(senderID, pageId, 1);
        break;
        case 'hello':
        getUserName(senderID, pageId);
        break;
        
            
        default:
        sendTextMessage(senderID, pageId, "Thank You for your Response, have a nice Day");
      }
    } else if (messageAttachments) {
        sendTextMessage(senderID, pageId, "Message with attachment received");
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

function sendTextMessage(sender, pageId, messageText) {
	var messageData = {
		 recipient: {
           id: sender
        },
        message: {
          text: messageText
        }
    };

    callSendAPI(messageData, pageId);
}

function callSendAPI(messageData,pageId) {

 
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token[pageId]},
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

function startConversation(userId, pageId, messageText){
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


  callSendAPI(messageData, pageId);
}

//quick link test
function startConversationQ(userId, pageId, messageText){
    var messageData = {
    recipient: {
      id:userId
    },
   message: {
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

  callSendAPI(messageData, pageId);
}


//getUserName
function getUserName(userId,pageId, isHi) {
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token[pageId];

 request({
    uri: getInfoUserAPI,
    method: 'GET',   

  }, function (error, response, body) {
 
    if (!error && response.statusCode == 200) {
     var jsonData = JSON.parse(body);
     var newMessage = "Hi "+jsonData.first_name+" "+jsonData.last_name+" . I am riya , welcome to DHFL Bot. I can help you with the following services";
     
     sendTextMessage(userId, pageId, newMessage);
      setTimeout(function(){ 
          if(isHi){
            startConversationQ(userId, pageId, newMessage);
          }else {
            startConversation(userId, pageId, newMessage);
          }
          
        }, 1000);
    } else {
      console.error("Unable to send message1.");
      console.error(response);
      console.error(error);
    }
  }); 


}

//hi for quicklinks
// function getUserNameQ(userId,pageId) {
//   var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token[pageId];

//  request({
//     uri: getInfoUserAPI,
//     method: 'GET',   

//   }, function (error, response, body) {
 
//     if (!error && response.statusCode == 200) {
//      var jsonData = JSON.parse(body);
//      var newMessage = "Hi "+jsonData.first_name+" "+jsonData.last_name+" . I am riya , welcome to DHFL Bot. I can help you with the following services";
     
//      sendTextMessage(userId, pageId, newMessage);
//       setTimeout(function(){ 
//           startConversationQ(userId, pageId, newMessage);
//         }, 1000);
//     } else {
//       console.error("Unable to send message1.");
//       console.error(response);
//       console.error(error);
//     }
//   }); 


// }


// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})