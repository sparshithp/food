/*
var mongoose = require('mongoose');
var deliveryBoySchema = new mongoose.Schema({
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
    employeeId:Number,
    location: {
        type: { type: String }
      , coordinates: []
    },
    coverage: {
        type: { type: String }
      , coordinates: [[[Number]]]
    },
    charity: String
});
//deliveryBoySchema.index({ location: '2dsphere' });
//deliveryBoySchema.index({ coverage: '2dsphere' });
module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
    */