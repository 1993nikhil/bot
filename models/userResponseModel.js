var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var responseSchema = new Schema({
  recipientId: String,
  questionIndex: String,
  responseData: String,
  
});

// the schema is useless so far
// we need to create a model using it
var Response = mongoose.model('Response', responseSchema);

// make this available to our users in our Node applications
module.exports = Response