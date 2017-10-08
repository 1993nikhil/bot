var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
  recipientId: String,
  userName: String,
  questionIndex: Number,
});

// the schema is useless so far
// we need to create a model using it
var Log = mongoose.model('Log', logSchema);

// make this available to our users in our Node applications
module.exports = Log