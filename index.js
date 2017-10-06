var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var fb_api = require('./routes/fbapi')
var mongoose = require('mongoose');

app.set('port', (process.env.PORT || 5000))
app.set('mongo_url',('mongodb://heroku_g7rvskm9:kcnrvqiqag5fs9e7b3kpdrdpj1@ds161574.mlab.com:61574/heroku_g7rvskm9'));



mongoose.connect(app.get('mongo_url'),function(err){
  if(err){
    console.log(err);
    process.exit(1);
  }
  console.log("connected to " + app.get('mongo_url'));
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


app.get('/user', function (req, res) {
	Log.find({},{},function(err, data){
		if(err){
			res.send(err);
			console.log("error");
		}
		res.json(data);
	});
})






// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', fb_api.facebookWebhookListener); 

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})