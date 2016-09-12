/**
 * Created by sparshithp on 5/3/16.
 */

var mongoose = require('mongoose');
var chefSchema = new mongoose.Schema({
	name : String,
    sex: String,
    age: Number,
    description: String,
    areaId: String,
    address: String,
    phone: Number,
    cuisines: String,
    imageUrl: String

});

module.exports = mongoose.model('Chef', chefSchema);