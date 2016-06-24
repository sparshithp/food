
var Order = require('../models/Order');
var Meal = require('../models/Meal');
var Food = require('../models/Food');
var Chef = require('../models/Chef');
var DeliveryBoy = require('../models/DeliveryBoy');
var Area = require('../models/Area');

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
        	 console.log("Could not find meal");
        	 res.send({message: "Sorry all meals sold out !!"});
        	 return;
         }
         if(!meal.remainingCount || meal.remainingCount <= 0){
        	 res.send({message: "Sorry all meals sold out !!"});
        	 removeMeal(meal);
        	 return;
         }
 
        var remainingCount = meal.remainingCount - orderCount;
         if(remainingCount < 0){
        	 res.send({message: "Sorry we have only " + meal.remainingCount + " remaining "});
        	 return;
         }
         
    	
         updateMealCount(meal, orderCount);
    	 var order = new Order();
    	 createAndSaveOrder(order, meal, consumerId, req.body.consumerName, req.body.consumerLocation);
    	 res.send({message : "Your Order is Placed !! "});
         
	 }); 
};

function updateMealCount(meal, orderCount){

	meal.remainingCount = meal.remainingCount - orderCount;
	meal.orderedCount = meal.orderedCount + orderCount;
	
	if(meal.remainingCount == 0){
		meal.status = "COMPLETE";
	}
	saveMeal(meal);
}


function removeMeal(meal){

	meal.status = "INACTIVE";
	saveMeal(meal);
}

function saveMeal(meal){
	 meal.save(function(err){
	        if(err){
	            console.log("error while saving meal");
	        }else{
	            console.log("saved meal");
	        }
	    });
}

function createAndSaveOrder(order, meal, consumerId, consumerName, consumerLocation){
	
	 order.chefId = meal.chefId;
	 order.chefName = meal.chefName;
	 order.chefLocation = meal.chefLocation;

	 order.consumerId = consumerId;
	 order.consumerName = consumerName;
	 order.consumerLocation = consumerLocation;
	 
	 order.currentLocation = meal.chefLocation;
	 
	 order.mealId = meal._id;
	 order.count = meal.orderedCount;
	 order.mealType = meal.mealType;
	 order.spiceLevel = meal.spiceLevel;
	 order.cuisine = meal.cuisine;
	 order.areaId = meal.areaId;
	 order.areaName = meal.areaName;
	
	 order.status = "INITIATED";
	 
	 saveOrder(order);
}

exports.getById = function(req, res){

    console.log(req.params.id);
    Order.findOne({_id: req.params.id}, function(err, order){
        if(err){
            res.send({message : "Problem retrieving"});
        }else{
            res.send({order: order});
        }
    });
};


exports.trackOrder = function(req, res){
	
	Order.findOne({_id: req.params.id}, function(err, order){
        if(err){
            res.send(err);
        }else{
        	res.send(order);
        }
    });
};

exports.updateOrder = function(req, res){

	Order.findOne({_id: req.params.id}, function(err, order){
		if(err){
			res.send(err);
		}else{
			
			order.deliveryBoyId = req.body.deliveryBoyId;
			order.deliveryBoyName = req.body.deliveryBoyName;
			order.status = req.body.status;
			
			if(order.status == "PICKED"){
				order.pickedTime = new Date();
        		updateCurrentLocationOfDeliveryBoy(order);
        		res.send("Success!!, Please Deliver it Soon");
        	}else if(order.status == "DELIVERED"){
        		order.deliveredTime = new Date();
        		order.currentLocation = order.consumerLocation;
        		saveOrder(order);
        		res.send("Order is Complete !!, Thanks for Delivering");
        	}

		}
	});
};


function updateCurrentLocationOfDeliveryBoy(order, callback){
	
	console.log("deliveryBoyId : " + order.deliveryBoyId);
	
	 DeliveryBoy.findOne({_id: order.deliveryBoyId}, function(err, deliveryBoy){
	        if(err){
	            console.log(err);
	        }else{
	        	console.log("enapa idu");
	           order.currentLocation = {type: "Point", coordinates : [12.906033, 77.604022]};
	           saveOrder(order);
	        }
	  });
	 
}

function saveOrder(order){
	order.save(function(err){
		if(err){
			res.send("Error while saving order");
		}else{
			console.log("Saved Order ");
		}
	});
}