var Q = require('q');
var policyDetail = require('./policyData');
var request = require('request');

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
			if(policyDetail.policy.PolicyNo===response.PolicyNo && policyDetail.policy.DOB===response.DOB){
				return policyDetail.policy;
			}else{
				return null;
			}
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