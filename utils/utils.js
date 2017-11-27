var Q = require('q');
var policyDetail = require('./policyData');
var request = require('request');
var policyService = require('../services/policyDetailService');
var Policy = require('../models/policyDetailModel');

module.exports = {
		validatePolicyNumber: function (argument) {
			if(argument.length==8){
				var isnum = /^[0-9]{8}/.test(argument);
				return isnum;				
			}else{
				return false;
			}

		},
		validateDOB: function(argument){
			var isDOB = /^[0-9]{2}[-|\/]{1}[0-9]{2}[-|\/]{1}[0-9]{4}/.test(argument);
			return isDOB;
		},
		validatePolicy: function(response){

			var arr = policyDetail.policy;
			console.log('print arr',arr);
			console.log('is this array',typeof arr);
			for(var i = 0 ; i < arr.length;i++){
				if(arr[i].PolicyNo===response.policyNo){
					if(arr[i].DOB===response.DOB){
						return arr[i];
						break;
					}
				}
			}
			return null;

			  		
		},
		callService: function(url,type,data,success,failure){

		},
	    sendSMS: function(message, mobile) {
        if (mobile) {
            	request.post({
					  headers: {'content-type' : 'application/json'},
					  url: 'https://dhfl-aodkapsgv7xsfukzmx7s6fsd-dev.mbaas1.dpl.redhatmobile.com/sendMessage',
				 	  form: {
		                        "message": message,
		                        "mobile": mobile
		                    }
					}, function(error, response, body){
					  console.log(body);
					});
     
        }
    }
}