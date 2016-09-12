/**
 * Created by sparshithp on 5/3/16.
 */

var mongoose = require('mongoose');
var mealSchema = new mongoose.Schema({
    foodName: String,
    //image
    chefId: String,
    chefName: String,
    price: {type: Number, min:0},
    spiceLevel: String,
    cuisine: String,
    areaId: String,
    totalCount: {type: Number, min:0},
    orderedCount: {type: Number, min:0, default: 0},
    remainingCount: {type: Number, min:0},
    postingTime: { type : Date, default: Date.now },
    orderBeforeTime: { type : Date, default: Date.now },
    availableTime: { type : Date, default: Date.now },
    imageUrl: String,
    chefImageUrl : String
});

module.exports = mongoose.model('Meal', mealSchema);