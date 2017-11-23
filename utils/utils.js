var Q = require('q');
var policyDetail = require('./policyData');
var request = require('request');
var policyService = require('../services/policyDetailService');

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
			policyService.getPolicyDetail(response.policyNo).then(function(resp){
				if(resp){
					if(resp.policyNo===response.policyNo && resp.DOB===response.DOB){
						return resp;
					}
					else{
						return null
					}
				}
				else{
					return null
				}
			});
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