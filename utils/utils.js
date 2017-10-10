var Q = require('q');
var policyDetail = require('./policyData')

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
				return true;
			}else{
				return false;
			}
		},
		callService: function(url,type,data,success,failure){

		}


}