
var mongoose = require('mongoose');
var orderSchema = new mongoose.Schema({
	consumerId: String,
	consumerName: String,
	chefId: String,
	chefName: String,
	foodId: String,
    foodName: String,
    price: {type: Number, min:0},
    orderTime: { type : Date, default: Date.now },
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
    rating: {type: Number, min:0},
    photos: [String]
});

module.exports = mongoose.model('Order', orderSchema);