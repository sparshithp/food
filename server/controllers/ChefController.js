/**
 * Created by sparshithp on 5/13/16.
 */

var Area = require('../models/Area');
var Chef = require('../models/Chef');
var Order = require('../models/Order');
var AWS = require('AWS-sdk');
var fs = require('fs');
var formidable = require('formidable');
var uuid = require('uuid');

//var util = require('util'),
//var fs   = require('fs-extra'),
//var qt   = require('quickthumb');

exports.add = function(req, res){
	
	var form = new formidable.IncomingForm();
	form.uploadDir = '/Users/adarshmn/mygit/uploads';
	form.keepExtensions = true;
    
	
    form.parse(req, function(err, fields, files){
        if (err) return res.end('You found error');
        
        console.log(fields);
        console.log(files);
        
        
        
        var reqArea = fields.area;
        var reqCity = fields.city;
        if(!reqArea || !reqCity){
            res.send({
                message: 'Area and city compulsory'
            });
            return;
        }else{
            Area.findOne({area: reqArea, city: reqCity}, function(err, area){
                console.log(area);
                if(err){
                    res.send({message: "Error"});
                }else if(!area){
                    res.send({message: "Area and City not Valid"})
                }else{
                    var chef = new Chef();
                    chef.firstName = fields.firstName;
                    chef.lastName = fields.lastName;
                    chef.sex = fields.sex;
                    chef.age = Number(fields.age);
                    chef.description = fields.description;
                    chef.state = fields.state;    //stateEnum
                    chef.city = fields.state;      //cityEnum
                    chef.area = fields.area;
                    chef.areaId = area._id;
                    chef.streetAddress = fields.streetAddress;
                    chef.cuisines = fields.cuisines;
                    chef.charity = fields.charity;

                    chef.location.type = "Point";
                    chef.location.coordinates[0] = Number(fields.longitude);
                    chef.location.coordinates[1] = Number(fields.latitude);
                    chef.phone = Number(fields.phone);
                    chef.imageUrl = ""; 

                    chef._id = uuid.v4();
                    
                    console.log(files);
                    addChefToS3Bucket(chef, files.image);
                    
                    console.log(chef);
                    chef.save(function(err){
                        if(err){
                            res.send({message: "Problem adding chef", err})
                        }else{
                            res.send({message: "Successful"})
                        }
                    });
                }
            });
        }

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
        			res.send({chef: chef});
        		}else{
        			
        			chef.imageUrl = url;
        			res.send({chef: chef});
        		}
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
	
	AWS.config.loadFromPath("AWS-config.json");
	var s3 = new AWS.S3();
	var bucketParams = {Bucket: 'adarsh112.chefimages'};
	
	var s3Bucket = new AWS.S3( { params: bucketParams } );
	
  
	var urlParams = {Bucket: 'adarsh112.chefimages', Key: chef._id};
	s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){

		if(err){
			callback(err, null);
		}else{

			console.log('the url of the image is', url);
			callback(null, url);
		}
	})
}

function addChefToS3Bucket(chef, image){
	
	AWS.config.loadFromPath("AWS-config.json");

	var s3 = new AWS.S3();
	
	var s3Bucket = new AWS.S3( { params: {Bucket: 'adarsh112.chefimages'} } );

	fs.readFile(image.path, function(err, formImage){
		
		var s3Image = {Key: chef._id, Body: formImage};
		s3Bucket.putObject(s3Image, function(err, s3Image){
			if (err) 
			{ 
				console.log('Error uploading chef image: ', err); 
				return;
			} else {
				console.log('succesfully uploaded the image!');
				return;
			}
		});
	});
//	var data = {Key: chef._id, Body: image};
	
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