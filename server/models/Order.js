
var mongoose = require('mongoose');
var orderSchema = new mongoose.Schema({
	consumerId: String,
	consumerName: String,
	chefId: String,
	chefName: String,
	foodId: String,
    foodName: String,
    mealId: String,
    count: {type: Number, min:0},
    price: {type: Number, min:0},
    orderTime: { type : Date, default: Date.now },
    pickedTime: { type : Date},
    deliveredTime: { type : Date},
    mealType: String, 
    spiceLevel: String,
    cuisine: String,
    areaId: String,
    areaName: String,
    chefLocation: {
        type: { type: String }
      , coordinates: []
    },
    consumerLocation: {
        type: { type: String }
      , coordinates: []
    },
    currentLocation: {
        type: { type: String }
      , coordinates: []
    },
    status: String,
    deliveryBoyId: String, 
    deliveryBoyName: String, 
    rating: {type: Number, min:0},
    photos: [String]
});

module.exports = mongoose.model('Order', orderSchema);