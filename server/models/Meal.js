/**
 * Created by sparshithp on 5/3/16.
 */

var mongoose = require('mongoose');
var mealSchema = new mongoose.Schema({
    foodId: String,
    foodName: String,
    //image
    chefId: String,
    chefName: String,
    price: {type: Number, min:0},
    mealType: String, 
    diet: String,
    spiceLevel: String,
    cuisine: String,
    areaId: String,
    areaName: String,
    totalCount: {type: Number, min:0},
    orderedCount: {type: Number, min:0, default: 0},
    remainingCount: {type: Number, min:0},
    status: String,
    postingTime: { type : Date, default: Date.now },
    orderBeforeTime: { type : Date, default: Date.now },
    availableTime: { type : Date, default: Date.now },
    chefLocation: {
        type: { type: String }
      , coordinates: []
    },
    imageUrl: String,
    imageUrlSet: [String]
});

module.exports = mongoose.model('Meal', mealSchema);