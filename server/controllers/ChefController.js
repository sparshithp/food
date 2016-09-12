/**
 * Created by sparshithp on 5/13/16.
 */

var Area = require('../models/Area');
var Chef = require('../models/Chef');
var Order = require('../models/Order');
var awsConstants = require('../constants/AwsConstants');
var emailUtils = require('../notificationUtils/emailUtils');
var emaiConfig = require('../../email-config');

var AWS = require('AWS-sdk');
var fs = require('fs');
var formidable = require('formidable');
var uuid = require('uuid');

//var util = require('util'),
//var fs   = require('fs-extra'),
//var qt   = require('quickthumb');

exports.add = function(req, res){
	
	var form = new formidable.IncomingForm();
	form.uploadDir = './';
	form.keepExtensions = true;
    
	var responseMessage;
    form.parse(req, function(err, fields, files){
    	
        if (err) return res.end('form error');
        
        var reqArea = fields.areaId;
        
        console.log(reqArea);

        if(!reqArea){
        	res.send({message: 'Area compulsory'});
        	return;
        }

        Area.findById(reqArea, function(err, area){
        	if(err){
        		res.send({message: "Error"});
        	}else if(!area){
        		res.send({message: "Area not Valid"})
        	}else{
        		var chef = new Chef();
        		chef.name = fields.name;
        		chef.sex = fields.sex;
        		chef.age = Number(fields.age);
        		chef.description = fields.description;
        		chef.areaId = area._id;
        		chef.address = fields.address;
        		chef.cuisine = fields.cuisine;
        		chef.phone = Number(fields.phone);
        		chef.imageUrl = ""; 

        		console.log(files);
        		if(!files || !files.image){
        			responseMessage = "Dont Forget to update your Profile Picture " ;
        		}else{
        			addChefToS3Bucket(chef, files.image);
        		}

        		chef.save(function(err){
        			if(err){
        				res.send({message: "Problem adding chef", err})
        			}else{
        				responseMessage = "Successfully registered " + responseMessage;
        				res.send({message: "Chef created" })
        			}
        		});
        	}
        });

    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        console.log(bytesReceived + ' ' + bytesExpected);
    });

    form.on('error', function(err) {
        res.writeHead(400, {'content-type': 'text/plain'}); 
        res.end('error:\n\n'+util.inspect(err));
    });
};

exports.getById = function(req, res){

    //Exclude contact details of chef?
    console.log(req.params.id);
    Chef.findOne({_id: req.params.id}, function(err, chef){
        if(err){
            res.send({message : "Problem retrieving"});
        }else{
        	
        	getChefImageUrl(chef, function(err, url){
        		
        		if(err){
        			console.log(err);
        		}else{
        			chef.imageUrl = url;
        		}
        		
        		res.send({chef: chef});
        	});
        	
        }
    });
};

exports.list = function(req, res){
    Chef.find({}, function(err, chefs){
        if(err){
            res.send({message: "Unsuccessful"});
        }else{
            res.send({chefs : chefs});
        }
    });
};

exports.listOrdersByChefId = function(req, res){
	Order.find({chefId: req.params.id}, function(err, orders){
        if(err){
            res.send(err);
        }else{
            res.send({orders: orders});
        }
    });
};

function getChefImageUrl(chef, callback){
	
	AWS.config.loadFromPath("aws-config.json");
	var s3 = new AWS.S3();
	var bucketParams = {Bucket: awsConstants.CHEF_BUCKET};
	
	var s3Bucket = new AWS.S3( { params: bucketParams } );
	
	var urlParams = {Bucket: awsConstants.CHEF_BUCKET, Key: chef.name+chef.age};
	s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){

		if(err){
			callback(err, null);
		}else{

			console.log('the url of the image is', url);
			callback(null, url);
		}
	});
	
}

function addChefToS3Bucket(chef, image){
	
	AWS.config.loadFromPath("aws-config.json");

	var s3 = new AWS.S3();
	
	var s3Bucket = new AWS.S3( { params: {Bucket: awsConstants.CHEF_BUCKET} } );

	fs.readFile(image.path, function(err, formImage){
		
		var s3Image = {Key: chef.name+chef.age, Body: formImage};
		s3Bucket.putObject(s3Image, function(err, s3Image){
			if (err) 
			{ 
				console.log('Error uploading chef image to s3 bucket ', err); 
				return;
			} else {
				console.log(s3Image);
				console.log('succesfully uploaded the image to s3 bucket ');
				fs.unlink(image.path,function(err){
			        if(err)
						return console.log('Error while deleting from our temp ', err);
			        console.log('And deleted from our tmp location');
			   });  
				return;
			}
		});
	});
}

exports.upload = function(req, res) {
    var form = new formidable.IncomingForm;
    form.keepExtensions = true;
    
	
	console.log("upload");
//	AWS.config.loadFromPath("AWS-config.json");
//
//	var s3 = new AWS.S3();
//	var bucketParams = {Bucket: '576945948d8c0e3bb29b54ce'};
//	s3.createBucket(bucketParams, function(err) {
//
//	      if (err)       
//
//	          console.log(err)     
//
//	      else       console.log("Successfully uploaded data to myBucket/myKey");   
//
//	   });
//	
//	var s3Bucket = new AWS.S3( { params: {Bucket: 'adarsh112bucket'} } );
//	
//	var imgPath = '/Users/adarshmn/mygit/chef1.jpg';
//	var data = {Key: "testing/chef1image", Body: fs.readFileSync(imgPath)};
//	
//	s3Bucket.putObject(data, function(err, data){
//	  if (err) 
//	    { 
//		  console.log('Error uploading data: ', err); 
//		 
//	    } else {
//	      console.log('succesfully uploaded the image!');
//	      
//	    }
//	});
	      
//	var urlParams = {Bucket: 'adarsh112bucket', Key: 'testing/chef1image'};
//	s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
//	  console.log('the url of the image is', url);
//	  res.send(url);
//	})
};
