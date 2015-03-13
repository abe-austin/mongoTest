var fs = require('fs');
var http = require('http'); 
var url = require('url');
var ROOT_DIR = "/usr/local/src/projects/node";
var connect = require('connect');

var app = connect()
//.use(connect.logger('dev'))
//.use(connect.static('home'))
.use(function(req, res)
{
	res.setHeader("Access-Control-Allow-Origin", "*");
	
	
	var urlObj = url.parse(req.url, true, false);  
//  fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) 
//  {		
	if(urlObj.pathname.indexOf("comment") !=-1)
	{
		console.log("comment route");
		if(req.method === "POST")
		{
			//Get the POST data as a json object
			var jsonData = "";
			req.on('data', function (chunk) 
			{
				jsonData += chunk;
			});
			req.on('end', function () 
			{
				var reqObj = JSON.parse(jsonData);
				console.log("Was a POST");
				console.log(reqObj);
				
				//Store this into a mongo database
				var MongoClient = require('mongodb').MongoClient;
				MongoClient.connect("mongodb://localhost/weather", function(err, db) 
				{
					if(err) throw err;
					db.collection('comments').insert(reqObj,function(err, records) 
					{
						console.log("Record added as "+records[0]._id);
						//Write something back to client?
						res.writeHead(200);
						res.end("");
					});
					
				});
			});
		}
		else if(req.method === "GET")
		{
			console.log("In GET");
			
			//Retrieve from the database
			var MongoClient = require('mongodb').MongoClient;
			MongoClient.connect("mongodb://localhost/weather", function(err, db) 
			{
				if(err) throw err;
				db.collection("comments", function(err, comments)
				{
					if(err) throw err;
					comments.find(function(err, items)
					{
						items.toArray(function(err, itemArr)
						{
							console.log("Document Array: ");
							console.log(itemArr);
							
							res.writeHead(200);
							res.end(JSON.stringify(itemArr));
						});
					});
				});
			});
		}
	}
});

var server = http.createServer(app);
server.listen(80, function()
{});;