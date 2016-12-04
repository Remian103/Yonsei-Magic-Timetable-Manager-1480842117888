/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});


var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));






//connect to cloudant
var Cloudant = require('cloudant');
var cloudant = Cloudant({account:"80cb3b05-a31c-4abd-a20b-faeb33469db5-bluemix", password:"35419efd486c69b2683d986424d38a04d09184add9861e9a2141bbb4f5a0e66f"});
var db = cloudant.db.use('course_db');
var db_categorize = cloudant.db.use('categorize');


//watson conversation
var watson = require('watson-developer-cloud');

var conversation = watson.conversation({
  username: 'ef284d55-eefd-4189-ae46-60edd436012d',
  password: 'jpwp8Tx0QZw3',
  version: 'v1',
  version_date: '2016-09-20'
});

app.post("/test", function(req,res){
	console.log(req.body);
	var input_sentence = req.body.input_sentence;
	var context = req.body.cur_context;

	conversation.message({
		workspace_id: '8eb80f6d-3b40-4d25-b751-dd96469b688a',
		input: {'text': input_sentence},
		context: JSON.parse(context)
	},  function(err, response) {
		if (err)
			console.log('error:', err);
		else {
			res.json(updateMessage(response));
			console.log(JSON.stringify(response, null, 2));
		}
	});
});

function updateMessage(response) {
	var data = [];

	var node = response.context.system.dialog_stack[0].dialog_node;
	console.log(node);

	if(node == "node_1_1480802373533") { // multiple attribute process
		var attribute = [];
		for(var i = 0; i < response.entities.length; i++) {
			if(response.entities[i].entity == "attribute") {
				attribute.push(response.entities[i].value);
			}
		}
		response.context.ask_information.attribute = attribute;
	}
	if(response.output.text == "call ask_information data") { // multiple attribute process
		var attribute = [];
		for(var i = 0; i < response.entities.length; i++) {
			if(response.entities[i].entity == "attribute") {
				attribute.push(response.entities[i].value);
			}
		}
		response.context.ask_information.attribute = attribute;
	}

	if(node == "node_24_1480686812762") { // multiple big category process
		var big_category = [];
		for(var i = 0; i < response.entities.length; i++) {
			if(response.entities[i].entity == "big_category") {
				big_category.push(response.entities[i].value);
			}
		}
		response.context.find_condition.big_category = big_category;
	}
	if(node == "node_9_1480746508840") { // multiple small category process
		var small_category = [];
		for(var i = 0; i < response.entities.length; i++) {
			if(response.entities[i].entity == "small_category") {
				small_category.push(response.entities[i].value);
			}
		}
		response.context.find_condition.small_category = small_category;
		response.context.find_condition.isIncludeCategory = "true";
	}

	if(node == "node_5_1480750435530" || node == "node_4_1480792932664") { // multiple time process
		var time = {
			"condition":"null",
			"array":[]
		};
		var day = [];
		var period = [];

		if(response.intents[0].intent == "negative") {
			time.condition = "exclude";
		} else {
			time.condition = "include";
		}

		for(var i = 0; i < response.entities.length; i++) {
			if(response.entities[i].entity == "day") {
				day.push(response.entities[i].value);
			}
			if(response.entities[i].entity == "sys-number") {
				period.push(response.entities[i].value);
			}
		}

		if(day.length > 0) {
			if(period.length > 0) {
				for(var i = 0; i < day.length; i++) {
					for(var j = 0; j < period.length; j++) {
						time.array.push(day[i]+period[j]);	
					}
				}
			} else {
				for(var i = 0; i < day.length; i++) {
					for(var j = 0; j <= 13; j++) {
						time.array.push(day[i]+j);
					}
				}
			}
		} else {
			for(var i = 0; i < period.length; i++) {
				time.array.push("mon"+period[i],"tue"+period[i],"wed"+period[i],"thu"+period[i],"fri"+period[i],"sat"+period[i],"sun"+period[i]);
			}
		}

		response.context.find_condition.time = time;
	}

	return response;
}


//when we get all condition, then find data with cloudant 

//for finding courses.
app.post("/docs", function(req,res){
	var obj = findCourse(JSON.parse(req.body.cur_context));
	console.log(JSON.stringify({"obj":obj},null,2));
	db.find({selector:{"$and":obj}}, function(err, result) {
  		if (err)
			console.log('error:', err);
		else {
			res.json(result);
  			console.log('Found %d documents', result.docs.length);
		}
	}); 
});

//for getting information
app.post("/info", function(req,res){
	var obj = JSON.parse(req.body.info);
	console.log(JSON.stringify({"obj":obj},null,2));
	db.find({selector:{"$and":[{course:obj.course}]}}, function(err, result) {
  		if (err)
			console.log('error:', err);
		else {
			res.json(result);
  			console.log('Found %d documents', result.docs.length);
		}
	}); 
});

//for categorizing
app.post("/cate", function(req,res){
	var obj = JSON.parse(req.body.category);
	console.log(JSON.stringify({"obj":obj},null,2));
	db_categorize.find({selector:{"$and":[{college:obj.big_category}]}}, function(err, result) {
  		if (err)
			console.log('error:', err);
		else {
			res.json(result);
  			console.log('Found %d documents', result.docs.length);
		}
	}); 
});

//for recommending mileage point
app.post("/mileage", function(req,res){
	var obj = JSON.parse(req.body.mileage);
	console.log(JSON.stringify({"obj":obj},null,2));
	db.find({selector:{"$and":[{course:obj.course}]}}, function(err, result) {
  		if (err)
			console.log('error:', err);
		else {
			res.json(result);
  			console.log('Found %d documents', result.docs.length);
		}
	}); 
});

function findCourse(ficd) {
	var obj = [];
	if(ficd.professor!="all")
		obj.push({professor:{"$in":[ficd.professor]}});
	if(ficd.weight!="all")
		obj.push({weight:ficd.weight});
	if(ficd.pnp!="all")
		obj.push({pnp:ficd.pnp});
	if(ficd.rating!="all") {
		if(ficd.rating.compare=="lower")
			obj.push({rating:{"$lte":ficd.rating.value}});
   		if(ficd.rating.compare=="higher")
     	 	obj.push({rating:{"$gte":ficd.rating.value}});
   		if(ficd.rating.compare=="equal")
      		obj.push({rating:ficd.rating.value});
	}
	if(ficd.credit!="all") {
   		if(ficd.credit.compare=="lower")
      		obj.push({credit:{"$lte":ficd.credit.value}});
   		if(ficd.credit.compare=="higher")
      		obj.push({credit:{"$gte":ficd.credit.value}});
   		if(ficd.credit.compare=="equal")
     		obj.push({credit:ficd.credit.value});
	}
	if(ficd.mileage!="all") {
   		if(ficd.mileage.compare=="lower")
      		obj.push({mileage:{"$lte":ficd.mileage.value}});
   		if(ficd.mileage.compare=="higher")
      		obj.push({mileage:{"$gte":ficd.mileage.value}});
   		if(ficd.mileage.compare=="equal")
      		obj.push({mileage:ficd.mileage.value});
	}
	if(ficd.big_category!="all") {
   		if(ficd.small_category!="all") {
      		obj.push({category:{major:{"$in":ficd.small_category}}});
   		}
   		obj.push({category:{college:{"$in":ficd.big_category}}});
	}
	if(ficd.time!="all") {
   		if(ficd.time.condition=="include")
      		obj.push({time:{"$in":ficd.time.array}});
   		else
      		obj.push({time:{"$not":{"$in":ficd.time.array}}})
	}
	return obj;
}





//document conversion
var fs = require("fs");
var multer = require("multer");

const document_conversion = watson.document_conversion({
  username: 'a51ca65e-776c-42e8-bb5b-4480d952e1c0',
  password: 'mlo67ua6vBXB',
  version: 'v1',
  version_date: '2015-12-15'
});

// custom configuration
var config = {
	word: {
		heading: {
			fonts: [
				{ level: 1, min_size: 24 },
				{ level: 2, min_size: 16, max_size: 24 }
			]
		}
	}
};

app.post("/dc/simpleupload", multer({ dest: "./uploads"}).single("uploadedFile"), function(req,res){
	console.log(req.file);
	var originalFileName = req.file.originalname.split(".")[0];
	var uploadedFileName = req.file.filename;
	var fileExtension = req.file.originalname.split(".")[1];
	fs.exists("./uploads/" + uploadedFileName, /*@callback */ function(exists){
		fs.rename("./uploads/" + uploadedFileName, "./uploads/" + uploadedFileName + "." + fileExtension, function(err){
  			if(err) {
  				console.log(err);
  			} else {
				document_conversion.convert({
					file: fs.createReadStream("./uploads/" + uploadedFileName + "." + fileExtension),
					conversion_target: 'ANSWER_UNITS',
					// Use a custom configuration.
					config: config
					}, function (err, response) {
					if (err) {
						console.error(err);
					} else {
						res.json(JSON.stringify(response, null, 2));
					}
				});
  			}
  		});
	});
});