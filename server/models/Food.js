/**
 * Created by sparshithp on 5/3/16.
 */

var mongoose = require('mongoose');
var foodSchema = new mongoose.Schema({
    name : String,
    cuisine: [String],
    diet: String, //veg only, egg ok, meat
    mealType: String, //breakfast, lunch, evening snack
    spiceLevel: String //mild, medium, hot
});

module.exports = mongoose.model('Food', foodSchema);