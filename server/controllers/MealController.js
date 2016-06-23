/**
 * Created by sparshithp on 5/13/16.
 */
var Meal = require('../models/Meal');
var Food = require('../models/Food');
var Chef = require('../models/Chef');

exports.add = function(req, res){
    var chefId = req.body.chefId;
    var meal = new Meal();
    var foodId = req.body.foodId;
    if(!chefId){
        res.send({message: "Chef ID can't be empty !!"});
    }else{
        Chef.findOne({_id: chefId}, function(err, chef){
            if(err){
                res.send({message: "error"});
            }else if(!chef){
                res.send({message: "Can't find chef !!"});
            }else{
                meal.chefId = chefId;
                meal.chefName = chef.firstName + " " + chef.lastName;
                meal.areaName = chef.areaName;
                meal.areaId = chef.areaId;
                meal.spiceLevel = req.body.spiceLevel;
                meal.price = req.body.price;
                meal.totalCount = req.body.count;
                meal.remainingCount = req.body.count;
                meal.chefLocation = chef.location;
                Food.findOne({_id: foodId}, function(err, food){
                    if(err){
                        res.send({message: "Error"});
                    }else if(!food){
                        res.send({message:"Food Invalid"});
                    }else{
                        meal.foodId = foodId;
                        meal.foodName = food.name;
                        meal.cuisine = food.cuisine;
                        meal.diet = food.diet;
                        meal.photos = food.photos;
                        meal.save(function(err){
                            if(err){
                            	console.log(err);
                                res.send({problem : "err"});
                            }else{
                                res.send({message : "successful"});
                            }
                        });
                    }
                });
                
                var availableTime = req.body.availableTime;
                if(availableTime != null){
                	meal.availableTime = new Date(availableTime);
                }
                meal.status = "ACTIVE";
            }
        });
    }
};

exports.list = function(req, res){
	console.log("list");
	Meal.find({}, function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    })
};

exports.remove = function(req, res){
	console.log("remove");
	
	var mealId = req.params.mealId;

	if(!mealId){
        res.send({message: "mealId is missing"});
        return;
    }
	
	 Meal.findOne({_id: mealId}, function(err, meal){
         if(err){
             res.send({message: "error"});
             return;
         }
         if(!meal){
        	 console.log("Could not find meal");
        	 res.send({message: "Sorry all meals sold out !!"});
        	 return;
         }
         
         meal.status = "INACTIVE";
         meal.save(function(err){
 	        if(err){
 	           console.log("error while saving removed meal");
 	           res.send({message: "Sorry all meals sold out !!"});
 	        }else{
 	        	if(meal.orderedCount >= 1){
 	        		res.send({message: "You have received "+meal.orderedCount+ " orders. Your rating will be reduced by doing so ."});
 	        	}else{
 	        		console.log("removed meal");
 	        	}
 	        }
 	    });
	 });
};

exports.listByAreaId = function(req, res){
	console.log("listByAreaId");
	var query = Meal.find(
			{
				areaId: req.params.areaId,
				status: "ACTIVE"
			}); //cur time is lte availableztime + 1 hour 

	query.exec(function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    });
};

exports.listByFoods = function(req, res){

	Meal.aggregate([
                    { $match: {
                    	areaId: req.params.areaId,
                    	status: "ACTIVE"
                    }},
                    { $group: {
                    	_id: {
                            "foodId": "$foodId",
                            "foodName": "$foodName"
                        },
                        chefs : {$sum : 1},
                        minPrice : {$min : "$price"},
                        maxPrice : {$max : "$price"}
                    }}
                ], function (err, meals) {
                    if (err) {
                    	res.send({message: "error"});
                        return;
                    }
                    
                    res.send({meals: meals});
                });
};

exports.listByChefsForFood = function(req, res){
	
	var query = Meal.find({"areaId":req.params.areaId,"foodId": "574ea4d87c06a3327bc74bba"}); //hardcoded
	
	query.exec(function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    });
};

exports.listByChefs = function(req, res){
	
	console.log(req.query);
	
	var query = Meal.find({areaId: req.query.areaId});
	query.exec(function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    });
};