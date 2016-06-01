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
                meal.count = req.body.count;
                Food.findOne({_id: foodId}, function(err, food){
                    if(err){
                        res.send({message: "Error"});
                    }else if(!food){
                        res.send({message:"Food Invalid"});
                    }else{
                        meal.foodId = foodId;
                        meal.foodName = food.name;
                        meal.cuisine = food.cuisine;
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
            }
        });
    }
};

exports.list = function(req, res){
    Meal.find({}, function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    })
};

exports.listByAreaId = function(req, res){
	
	var query = Meal.find({areaId: req.params.areaId});

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
                    	//spiceLevel: "spicy"
                    }},
                    { $group: {
                        _id: "$foodId",
                        _id : "$foodName",
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
	
	var query = Meal.find({"areaId":req.params.areaId,"foodId": "574ea4d87c06a3327bc74bba"});
	
	query.exec(function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    });
};

exports.listByChefs = function(req, res){
	
	var query = Meal.find({areaId: req.params.chefId});

	query.exec(function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    });
};