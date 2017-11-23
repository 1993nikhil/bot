var Q = require('q');
var policyDetail = require('./policyData');
var request = require('request');
var policyService = require('../services/policyDetailService');
var Policy = require('../models/policyDetailModel');

module.exports = {
		validatePolicyNumber: function (argument) {
			var isnum = /^[0-9]{8}/.test(argument);
			return isnum;
		},
		validateDOB: function(argument){
			var isDOB = /^[0-9]{2}[-|\/]{1}[0-9]{2}[-|\/]{1}[0-9]{4}/.test(argument);
			return isDOB;
		},
		validatePolicy: function(response){
			  Policy.find({policyNo:response.policyNo}, function(err,data){
			    if(err){
			      console.log("error1");
			      return null
			    }else{
					if(data.policyNo===response.policyNo && data.DOB===response.DOB){
						console.log("detail matched");
						return data;
					}
					else{
						console.log("detail not matched in if");
						return null
					}
			    }
			   }); 
			  		
			// policyService.getPolicyDetail(response.policyNo).then(function(resp){
			// 	if(resp){
			// 		if(resp.policyNo===response.policyNo && resp.DOB===response.DOB){
			// 			console.log("detail matched");
			// 			return resp;
			// 		}
			// 		else{
			// 			console.log("detail not matched in if");
			// 			return null
			// 		}
			// 	}
			// 	else{
			// 		console.log("detail not matched outside if");
			// 		return null;
			// 	}
			// });
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