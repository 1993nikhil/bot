var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var polSchema = new Schema({
  recipientId: String,
  policyNo: String,
});

// the schema is useless so far
// we need to create a model using it
var Pol = mongoose.model('Pol', polSchema);

// make this available to our users in our Node applications
module.exports = Pol