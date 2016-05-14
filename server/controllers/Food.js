/**
 * Created by sparshithp on 5/13/16.
 */

var Food = require('../models/Food');

exports.add = function(req, res){
    var food = new Food();
    food.name = req.body.name;
    food.desc = req.body.desc;
    food.cuisine = req.body.cuisine;
    food.diet = req.body.diet;
    food.mealType = req.body.mealType;
    food.spiceLevel = req.body.spiceLevel;
    food.photos = req.body.photos;

    food.save(function(err){
        if(err){
            res.send({message: "Problem adding food"})
        }else{
            res.send({message: "Successful"})
        }
    });
};

exports.getById = function(req, res){

    //Exclude contact details of chef?
    Food.findById(req.params.id, function(err, food){
        if(err){
            res.send({message : "Problem retrieving"});
        }else{
            res.send({food: food});
        }
    });
};

exports.list = function(req, res){
    Food.find({}, function(err, foods){
        if(err){
            res.send({message: "Unsuccessful"});
        }else{
            res.send({foods : foods});
        }
    });
}