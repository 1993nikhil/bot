'use strict';
const defaultUser = [{
	"policyNo":"12345678",
		"DOB":"01-01-1994",
		"mobile":"8002848962"
},{
	"policyNo":"99887766",
		"DOB":"03-12-1993",
		"mobile":"8059533445"
}]

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var policySchema = new Schema({
  "policyNo": Number,
  "DOB": String,
  "mobile": Number,
});

var Policy = mongoose.model('Policy', policySchema);

Policy.count({},function(err,docs){
	if(err){
		console.log(err);
	} else {
		if(docs < 1){
			for(var i = 0 ; i < defaultUser.length;i++){
				var usr = new Policy(defaultUser[i]);
				usr.save(function(err){
					if(err){
						console.log(err);
					} else {
						console.log('user created');
					}
				}); 
			}
		}
	}
});
// make this available to our users in our Node applications
module.exports = Policy
