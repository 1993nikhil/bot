var token = {
  492841481078418: 'EAABslGNoL6QBANvp5xlRviWBBkaiV0rdgHuxfiUU0Pf3LZCZAJF3VulksBaSuHwSVUEPcpYdyza1b7JBpUNwqY0ePJUgTB15YOzOe0pfulu2UaNoMIqpsATFm0slRZAObb4gCA4mFbn1rYVWqDZA2l5ReCEOzZAXWGiacu8gZBZCQZDZD',
  121736051845888: 'EAABslGNoL6QBAHde5o5OraLFiCOk8L9ydxIJEDaFbZAJvjZCKww6dkihY9YbfU6uB7m45ZBLOwuvMBZCDZBeY7Bzr8rla94tjpXY1iKeSPxT15qzfHmm0VhkJZBq55ZCTQDsraTBGZCUTHk7k6FOskjPrbZBrAgroqhlvWEDmxzgkWAZDZD'
}

//getUserName
function getUserName(userId,pageId) {
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token[pageId];

 request({
    uri: getInfoUserAPI,
    method: 'GET',   

  }, function (error, response, body) {
 
    if (!error && response.statusCode == 200) {
     var jsonData = JSON.parse(body);
     var newMessage = "hi "+jsonData.first_name+" "+jsonData.last_name;
     return newMessage;
    } else {
      console.error("Unable to send message1.");
      console.error(response);
      console.error(error);
    }
  }); 


}