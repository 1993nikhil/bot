var express = require('express');
var request = require('request');
var fb_api = require('../routes/fbapi');
var Policy = require('../models/policyDetailModel');
var conf = require('../config/config');
var Q = require('q');

function getPolicyDetail(policyId){
  var deferred=Q.defer();
  Policy.findOne({policyNo:policyId}, function(err,data){
    if(err){
      deferred.reject(err);
      console.log("error");
    }else{
      deferred.resolve(data);
      console.log(data);
    }
  });
  return deferred.promise;	
}

module.exports = {
	getPolicyDetail:getPolicyDetail
};