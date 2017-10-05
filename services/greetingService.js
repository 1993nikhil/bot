var token = {
  492841481078418: 'EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD',
  121736051845888: 'EAABslGNoL6QBAHde5o5OraLFiCOk8L9ydxIJEDaFbZAJvjZCKww6dkihY9YbfU6uB7m45ZBLOwuvMBZCDZBeY7Bzr8rla94tjpXY1iKeSPxT15qzfHmm0VhkJZBq55ZCTQDsraTBGZCUTHk7k6FOskjPrbZBrAgroqhlvWEDmxzgkWAZDZD'
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