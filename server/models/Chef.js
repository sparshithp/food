/**
 * Created by sparshithp on 5/3/16.
 */

var mongoose = require('mongoose');
var chefSchema = new mongoose.Schema({
    firstName : String,
    lastName : String,
    sex: String,
    age: Number,
    description: String,
    state: String,     //stateEnum
    city: String,      //cityEnum
    area: String,
    areaId: String,
    streetAddress: String,
    phone: Number,
    cuisines:[String],
    location: {
        type: { type: String }
      , coordinates: []
    },
    charity: String
});
chefSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Chef', chefSchema);