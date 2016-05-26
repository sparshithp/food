
var mongoose = require('mongoose');
var orderSchema = new mongoose.Schema({
	consumerId: String,
	consumerName: String,
	chefId: String,
	chefName: String,
	foodId: String,
    foodName: String,
    price: {type: Number, min:0},
    mealType: String, 
    spiceLevel: String,
    cuisine: String,
    areaId: String,
    areaName: String,
    rating: {type: Number, min:0},
    photos: [String]
});

module.exports = mongoose.model('Order', orderSchema);