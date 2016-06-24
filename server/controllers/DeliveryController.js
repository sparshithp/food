
var Order = require('../models/Order');
var Meal = require('../models/Meal');
var Food = require('../models/Food');
var Chef = require('../models/Chef');
var DeliveryBoy = require('../models/DeliveryBoy');
var Area = require('../models/Area');

exports.add = function(req, res){
	console.log("adding delivery boy");
    var reqArea = req.body.area;
    var reqCity = req.body.city;
    if(!reqArea || !reqCity){
        res.send({
            message: 'Area and city compulsory'
        });
        return;
    }else{
         Area.findOne({area: reqArea, city: reqCity}, function(err, area){
            if(err){
                res.send({message: "Error"});
            }else if(!area){
                res.send({message: "Area and City not Valid"})
            }else{
                console.log(area);
                var deliveryBoy = new DeliveryBoy();
                deliveryBoy.firstName = req.body.firstName;
                deliveryBoy.lastName = req.body.lastName;
                deliveryBoy.sex = req.body.sex;
                deliveryBoy.age = req.body.age;
                deliveryBoy.description = req.body.description;
                deliveryBoy.state = req.body.state;    
                deliveryBoy.city = req.body.state;      
                deliveryBoy.area = req.body.area;
                deliveryBoy.areaId = area._id;
                deliveryBoy.streetAddress = req.body.streetAddress;
                deliveryBoy.cuisines = req.body.cuisines;
                deliveryBoy.charity = req.body.charity;
                deliveryBoy.coverage = req.body.coverage;
                deliveryBoy.location.type = "Point";
                deliveryBoy.location.coordinates = [12.906033, 77.604022];
                deliveryBoy.phone = req.body.phone;
console.log(deliveryBoy);
                deliveryBoy.save(function(err){
                    if(err){
                        res.send({message: "Problem adding deliveryBoy"})
                    }else{
                        res.send({message: "Successful"})
                    }
                });
            }
        });
    }

};

exports.getById = function(req, res){

    console.log(req.params.id);
    DeliveryBoy.findOne({_id: req.params.id}, function(err, deliveryBoy){
        if(err){
            res.send({message : "Problem retrieving"});
        }else{
            res.send({deliveryBoy: deliveryBoy});
        }
    });
};

exports.list = function(req, res){
	console.log("yaaa yaaa ");
	DeliveryBoy.find({}, function(err, deliveryBoys){
        if(err){
            res.send({message: "Unsuccessful"});
        }else{
            res.send({deliveryBoys : deliveryBoys});
        }
    });
};

exports.showMealsInMyCoverage = function(req, res){
	 console.log(req.params.id);
	 
	 var resp = {
			 myLocation : { type: { type: String }, coordinates: [] },
			 myCoverage : { type: { type: String }, coordinates: [[[]]] },
			 meals : Meal
	 }
		 
	  DeliveryBoy.findOne({_id: req.params.id}, function(err, deliveryBoy){
	        
		  if(err){
	            res.send({message : "Problem retrieving delivery boy"});
	       
		  }else{
	        	
			  var query = { 
		        		chefLocation: { $geoWithin : { $geometry : deliveryBoy.coverage }},
		        		status: "ACTIVE"
		       };
			  
	        	Meal.find(query, function(err, meals){
	                if(err){
	                    res.send({message: err});
	                }else{
	                	resp.myLocation = deliveryBoy.location;
	                	resp.myCoverage = deliveryBoy.coverage;
	                	resp.meals = meals;
	                	
	                    res.send(resp);
	                }
	            });
	        }
	    });
	
};

