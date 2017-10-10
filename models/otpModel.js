var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var otpSchema = new Schema({
  mobileNo: {type:Number,default:null},
  recipientId: String,
  otp: Number,
  expireTime: {type:Date,default:null},
  
});

var Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp