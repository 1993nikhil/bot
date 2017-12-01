var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var fb_api = require('./routes/fbapi')
var mongoose = require('mongoose');
var moment = require('moment');
var sql = require("mssql");
var sha1 = require('sha1');
var conf = require('./config/config');
var util = require('./utils/utils');

app.set('port', (process.env.PORT || 5000))
app.set('mongo_url',('mongodb://heroku_g7rvskm9:kcnrvqiqag5fs9e7b3kpdrdpj1@ds161574.mlab.com:61574/heroku_g7rvskm9'));



mongoose.connect(app.get('mongo_url'),function(err){
  if(err){
    console.log(err);
    process.exit(1);
  }
  console.log("connected to " + app.get('modelsngo_url'));
});


// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})
//dbtest
var Log = require('./models/logModel');
var Response = require('./models/userResponseModel');
var Otp = require('./models/otpModel');
var Policy = require('./models/policyDetailModel');
var Verify = require('./models/otpVerificationModel');

// Verify.remove(function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("data removed");
//   }
// });

app.get('/verify',function(req,res){
  Verify.find({},{},function(err, data){
    if(err){
      res.send(err);
      console.log("error");
    }
    res.json(data);
  });
})

app.get('/user', function (req, res) {
	Log.find({},{},function(err, data){
		if(err){
			res.send(err);
			console.log("error");
		}
		res.json(data);
	});
})

app.get('/response', function (req, res) {
  Response.find({},{},function(err, data){
    if(err){
      res.send(err);
      console.log("error");
    }
    res.json(data);
  });
})

app.get('/otp', function (req, res) {
  Otp.find({},{},function(err, data){
    if(err){
      res.send(err);
      console.log("error");
    }
    res.json(data);
  });
})



app.get('/student',function(req, res){
  var db = sql.connect('mssql://localhost/student');
  db.connect().then(function(){
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from student', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset);
            
        });
  });
})


var j = new Date();
var j = moment(j).add(30,'minutes');
console.log(j);

//sha1 test
var hash = sha1(975699);
console.log(hash);

console.log("conf.token -> "+conf.token);

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', fb_api.facebookWebhookListener); 

app.get('/sendMail', function (req, res) {
    util.sendMail('nikhil.kumar@geminisolutions.in','234223');
    res.send("email sending");
   // res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})