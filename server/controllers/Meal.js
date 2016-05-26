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
    Meal.find({areaId: req.params.areaId}, function(err, meals){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({meals: meals});
        }
    });
};