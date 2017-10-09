var express = require('express')
var request = require('request')
var fbCtrl = require('../controllers/fbController')
var fb_api = require('../routes/fbapi')
var Log = require('../models/logModel')
var Response = require('../models/userResponseModel')
var conf = require('../config/config')
var Q = require('q');


function checkUser(userId){

    var deferred=Q.defer();
    Log.findOne({recipientId:userId}, function(err, user){
      if(err){
        deferred.reject(err);
      }else{
        deferred.resolve(user);
      }

     
    });
     return deferred.promise;

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

//save user details to Log
function saveUser(userId){
  var getInfoUserAPI=' https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+conf.token;
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
      Log.findOne({recipientId:userId}, function(err, user){
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

//save user response
function saveResponse(userId, index, payload){
  var userResponse = {
    recipientId: userId,
    responseData: {
      questionIndex: index,
      answer: payload
    }

  }

  var res = new Response(userResponse);
  Response.findOne({recipientId:userId}, function(err, data){
    if(data){
      var query = {recipientId:userId, responseData:{questionIndex:index}};
      var newResponse = { $set: {responseData:{answer:payload}} };
      Response.updateOne(query, newResponse, function(err, res){
        if (err) {
          console.log(err);
        } else{
          console.log("Response updated");
        }
    
      });
    }
    else{
    res.save(function(err){
       if(err){
         console.log(err);
        }
        console.log('new question saved ');
     });    
    }
  });


}

module.exports = {
   checkUser:checkUser,
   updateQuestionIndex:updateQuestionIndex,
   saveUser:saveUser,
   saveResponse:saveResponse
};

