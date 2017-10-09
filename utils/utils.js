var Q = require('q');
module.exports = {
		validatePolicyNumber: function (argument) {
			var isnum = /^[0-9]{8}/.test(argument);
			return isnum;
		},
		validateDOB: function(argument){
			var isDOB = /^[0-9]{2}[-|\/]{1}[0-9]{2}[-|\/]{1}[0-9]{4}/.test(argument);
			return isDOB;
		},
		callService: function(url,type,data,success,failure){

		}


}