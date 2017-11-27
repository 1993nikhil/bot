var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var verifySchema = new Schema({
  recipientId: String,
  policyId: String,
  isOtpVerified:{type:Boolean,default:false}
});


var Verify = mongoose.model('Verify', verifySchema);

module.exports = Verify