var express = require('express')
var request = require('request')
var fbCtrl = require('../controllers/fbController')
var fb_api = require('../routes/fbapi')
var Log = require('../models/logModel')
var Response = require('../models/userResponseModel')
var Otp = require('../models/otpModel')
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

//get otp
function getOtp(userId){
  var deferred=Q.defer();
  Otp.findOne({recipientId:userId}, function(err, res){
    if(err){
      deferred.reject(err);
    }else{
      deferred.resolve(res);
    }
  });
  return deferred.promise;
}

//get Policy data response
function getPolicyData(userId){
  var deferred=Q.defer();
  Response.find({recipientId:userId}, function(err, res){
    if(err){
      deferred.reject(err);
    }else{

      handleResponse(res).then(function(customObj){
        deferred.resolve(customObj);
      })
      
    }
  });
  return deferred.promise;
}

function handleResponse(responses){
  var deferred = Q.defer();
  var policyDetail = {}
  
  for(var i in responses){
    (function(i){
      var resdata = responses[i].questionIndex;
      var resArray = resdata.split("-");
      var qIndex = parseInt(resArray[0]);
      if(qIndex===3){
        policyDetail['PolicyNo'] = responses[i].responseData;
      }
      if(qIndex===4){
        policyDetail['DOB'] = responses[i].responseData;
      }

    })(i);
  }
  deferred.resolve(policyDetail);
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

      Log.find({recipientId:userId}, function(err, user){
        if(user){
          //user exists

          console.log('user exist');
        }else{
          var jsonData = JSON.parse(body);
          var user = {
            recipientId: userId,
            userName: jsonData.first_name,
            questionIndex: "0-null-null"
          }

          var userDetail = new Log(user);          
          userDetail.save(function(err){
          if(err){
            console.log(err);
          }
            console.log('new user saved ');
          });

        }
      });

    }else{
      console.error("Unable to send message1.");
          console.error(response);
          console.error(error); 
    }

  });
}

//save user response
function saveResponse(userId, index, payload){

  Response.find({recipientId:userId, questionIndex:index}, function(err, data){
    if(data){
      var query = {recipientId:userId, questionIndex:index};
      var newResponse = { $set: { responseData:payload } };
      Response.updateOne(query, newResponse, function(err, res){
        if (err) {
          console.log(err);
        } else{
          console.log("Response updated");
        }
    
      });
    }
    else{
      var userResponse = {
        recipientId: userId,
        questionIndex: index,
        responseData: payload
      }

      var res = new Response(userResponse);      
      res.save(function(err){
        if(err){
         console.log(err);
        }
        console.log('new question saved ');
      });    
    }
  });


}

//save otp
function saveOtp(userId,otpGenerated){

  Otp.findOne({recipientId:userId}, function(err,data){
    if(data){
      var query = {recipientId:userId};
      var newOtp = { $set: { otp:otpGenerated } };
      Otp.updateOne(query, newOtp, function(err, res){
        if(err){
          console.log(err);
        }else{
          console.log('otp updated');
        }
      });
    }else{
      var otpRes = {
        recipientId:userId,
        otp:otpGenerated,
      }

      var otpGen = new Otp(otpRes);    
      otpGen.save(function(err){
        if(err){
          console.log(err);
        }else{
          console.log('otp saved');
        }
      });
    }
  });
}

module.exports = {
   checkUser:checkUser,
   updateQuestionIndex:updateQuestionIndex,
   saveUser:saveUser,
   saveResponse:saveResponse,
   getPolicyData:getPolicyData,
   getOtp:getOtp,
   saveOtp:saveOtp
};

