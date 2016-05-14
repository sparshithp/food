/**
 * Created by sparshithp on 5/13/16.
 */
var mongoose = require('mongoose');
var areaSchema = new mongoose.Schema({
    area : String,
    city: String
});

module.exports = mongoose.model('Area', areaSchema);