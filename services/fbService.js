var express = require('express');
var request = require('request');
var fbCtrl = require('../controllers/fbController');
var fb_api = require('../routes/fbapi');
var Log = require('../models/logModel');
var Response = require('../models/userResponseModel');
var Otp = require('../models/otpModel')
var conf = require('../config/config');
var Q = require('q');
var moment = require('moment');
var sha1 = require('sha1');
var util= require('../utils/utils');
var messages= require('../utils/messages');

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
function getOtp(userId,mobileNumber){
  var deferred=Q.defer();
  Otp.findOne({recipientId:userId, mobileNo:mobileNumber}, function(err, res){
    if(err){
      deferred.reject(err);
    }else{
      deferred.resolve(res);
    }
  });
  return deferred.promise;
}

//get Policy data response
function getPolicyData(userId,category){
  var deferred=Q.defer();
  Response.find({recipientId:userId}, function(err, res){
    if(err){
      deferred.reject(err);
    }else{

      handleResponse(res,category).then(function(customObj){
        deferred.resolve(customObj);
      });
      
    }
  });
  return deferred.promise;
}

//getbyid
function getPolicyById(userId,category){
  var deferred=Q.defer();
  Response.find({recipientId:userId}, function(err, res){
    if(err){
      deferred.reject(err);
    }else{
      handlePolicyId(res,category).then(function(policyObj){
        deferred.resolve(policyObj);
      });
    }
  });
  return deferred.promise;
}

function handleResponse(responses,category){
  var deferred = Q.defer();
  var policyDetail = {}
  
  for(var i in responses){
    (function(i){
      var resdata = responses[i].questionIndex;
      var resArray = resdata.split("-");
      var qIndex = parseInt(resArray[0]);
      if(qIndex===3&&resArray[1]===category){
        policyDetail['policyNo'] = responses[i].responseData;
      }
      if(qIndex===4&&resArray[1]===category){
        policyDetail['DOB'] = responses[i].responseData;
      }

    })(i);
  }
  deferred.resolve(policyDetail);
  return deferred.promise;
}

function handlePolicyId(responses,category){
  var deferred = Q.defer();
  var policyId = "";
  for(var i in responses){
    (function(i){
      var resdata = responses[i].questionIndex;
      var resArray = resdata.split("-");
      var qIndex = parseInt(resArray[0]);
      if(qIndex===3&&resArray[1]===category){
        policyId = responses[i].responseData;
      }
    })(i);
  }
  deferred.resolve(policyId);
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
        questionIndex: "0-null-null"
      }
 
      var userDetail = new Log(user);          
      userDetail.save(function(err){
      if(err){
        console.log(err);
      }
        console.log('new user saved ');
      });      

      // Log.find({recipientId:userId}, function(err, user){
      //   if(user){
      //     //user exists

      //     console.log('user exist');
      //   }else{
      //     var jsonData = JSON.parse(body);
      //     var user = {
      //       recipientId: userId,
      //       userName: jsonData.first_name,
      //       questionIndex: "0-null-null"
      //     }

      //     var userDetail = new Log(user);          
      //     userDetail.save(function(err){
      //     if(err){
      //       console.log(err);
      //     }
      //       console.log('new user saved ');
      //     });

      //   }
      // });

    }else{
      console.error("Unable to send message1.");
          console.error(response);
          console.error(error); 
    }

  });
}

//save user response
function saveResponse(userId, index, payload){
  var deferred = Q.defer();
  var userResponse = {
    recipientId: userId,
    questionIndex: index,
    responseData: payload
  }

  var res = new Response(userResponse);

  Response.findOne({recipientId:userId, questionIndex:index}, function(err, data){
    if(data){
      var query = {recipientId:userId, questionIndex:index};
      var newResponse = { $set: { responseData:payload } };
      Response.updateOne(query, newResponse, function(err, res){
        if (err) {
          deferred.reject(err);
        } else{
          deferred.resolve(res);
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
         deferred.reject(err);
        }
         deferred.resolve(res);
      });    
    }
  });

  return deferred.promise;


}

//save otp
function saveOtp(userId,otpGenerated,mobileNumber,timeOfMessage){
    var currentDate = moment(timeOfMessage).add(30,'minutes');
//    var hashOtp = sha1(otpGenerated);
    var otpRes = {
      recipientId:userId,
      otp:otpGenerated,
      mobileNo:mobileNumber,
      expireTime:currentDate
    }
    var otpGen = new Otp(otpRes);

  Otp.findOne({recipientId:userId}, function(err,data){
    if(data){
      var query = {recipientId:userId};
      var newOtp = { $set: { otp:otpGenerated, mobileNo:mobileNumber, expireTime:currentDate } };
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
        mobileNo:mobileNumber
      }

      var otpGen = new Otp(otpRes);    
      otpGen.save(function(err){
        if(err){
          console.log(err);
        }else{
          sendOTP(mobileNumber,otpGenerated,"Nikhil");
          console.log('otp saved');
        }
      });
    }
  });

  getUserName(userId).then(function(user){
    var senderName = user.userName;
    sendOTP(mobileNumber,otpGenerated,senderName);
  });
}

function sendOTP(mobileNo,OTP,userName){
  var otpMessage  = messages.messages.OTP;
  otpMessage = otpMessage.replace("#userName#",userName);
  otpMessage = otpMessage.replace("#otp#",OTP);
  util.sendSMS(otpMessage,mobileNo);

}

//get user name from log
function getUserName(userId){
  var deferred=Q.defer();
  Log.findOne({recipientId:userId}, function(err,data){
    if(err){
      deferred.reject(err);
    }else{
      deferred.resolve(data);
    }
  });
  return deferred.promise;
}

module.exports = {
   checkUser:checkUser,
   updateQuestionIndex:updateQuestionIndex,
   saveUser:saveUser,
   saveResponse:saveResponse,
   getPolicyData:getPolicyData,
   getOtp:getOtp,
   saveOtp:saveOtp,
   getPolicyById:getPolicyById
};

