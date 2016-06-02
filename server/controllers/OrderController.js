
var Order = require('../models/Order');
var Meal = require('../models/Meal');
var Food = require('../models/Food');
var Chef = require('../models/Chef');

exports.create = function(req, res){
	var consumerId = req.body.consumerId;
	var mealId = req.body.mealId;
	var orderCount = req.body.count;

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
             res.send({message: "Could not find the meal" + mealId});
             return;
         }
         if(!meal.count || meal.count <= 0){
        	 res.send({message: "Sorry all meals sold out !!"});
        	 meal.remove();
        	 return;
         }
 
        var remainingCount = meal.count - orderCount;
         if(remainingCount < 0){
        	 res.send({message: "Sorry we have only " + meal.count + " remaining "});
        	 return;
         }
         
    	 saveMeal(meal, orderCount);
    	 var order = new Order();
    	 saveOrder(order, meal, consumerId);
    	 
    	 res.send({message : "Your Order is Placed !! "});
         
	 }); 
};

function saveMeal(meal, orderCount){

	meal.count = meal.count - orderCount;
	if(meal.count == 0){
		meal.remove();
	}
	 meal.save(function(err){
        if(err){
            console.log("error while saving meal");
        }else{
            console.log("saved meal");
        }
    });
}

function saveOrder(order, meal, consumerId){
	
	 order.chefId = meal.chefId;
	 order.consumerId = consumerId;
	 order.chefName = meal.chefName;
	// order.consumerName = consumer;
	 order.mealType = meal.mealType;
	 order.spiceLevel = meal.spiceLevel;
	 order.cuisine = meal.cuisine;
	 order.areaId = meal.areaId;
	 order.areaName = meal.areaName;
	
	 order.save(function(err){
	        if(err){
	            console.log("error while saving order");
	        }else{
	            console.log("saved order");
	        }
	    });
}

exports.listByUserId = function(req, res){
	Order.find({consumerId: req.params.userId}, function(err, orders){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({orders: orders});
        }
    });
};