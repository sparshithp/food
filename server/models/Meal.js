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
    price: {type: Number, max:0},
    spiceLevel: String,
    cuisine: String,
    areaId: String,
    areaName: String
});

module.exports = mongoose.model('Meal', mealSchema);