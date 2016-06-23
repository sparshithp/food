
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
               // var pol = { type: 'Polygon', coordinates: [[[5,5], [5,5], [5,5], [5,5],[5,5]]] };
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
//                deliveryBoy.coverage.type = "Polygon";
//                deliveryBoy.coverage.coordinates[0][0][0] = 12.906033;
//                deliveryBoy.coverage.coordinates[0][0][1] = 77.604022;
//                deliveryBoy.coverage.coordinates[0][1][0] = 12.911550;
//                deliveryBoy.coverage.coordinates[0][1][1] = 77.604028;
//                deliveryBoy.coverage.coordinates[0][2][0] = 12.912990;
//                deliveryBoy.coverage.coordinates[0][2][1] = 77.608841;
//                deliveryBoy.coverage.coordinates[0][3][0] = 12.911965;
//                deliveryBoy.coverage.coordinates[0][3][1] = 77.615655;
//                deliveryBoy.coverage.coordinates[0][4][0] = 12.905165;
//                deliveryBoy.coverage.coordinates[0][4][1] = 77.612159;
                var myCoverage = { type: "Polygon", coordinates: [[[12.906033, 77.604022], [12.911550,77.604028], [12.912990,77.608841], [12.911965,77.615655],[12.905165,77.612159], [12.906033, 77.604022]]] };
                deliveryBoy.coverage = myCoverage;
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
	DeliveryBoy.find({}, function(err, deliveryBoys){
        if(err){
            res.send({message: "Unsuccessful"});
        }else{
            res.send({deliveryBoys : deliveryBoys});
        }
    });
};

exports.listMealsInMyCoverage = function(req, res){
	 console.log(req.params.id);
	    DeliveryBoy.findOne({_id: req.params.id}, function(err, deliveryBoy){
	        if(err){
	            res.send({message : "Problem retrieving delivery boy"});
	        }else{
	        	
	        	Meal.find({ 
	        		chefLocation: { $geoWithin : { $geometry : deliveryBoy.coverage }},
	        		status: "ACTIVE"
	        	}, function(err, meals){
	                if(err){
	                    res.send({message: err});
	                }else{
	                    res.send({meals : meals});
	                }
	            });
	        }
	    });
	    
	
};


