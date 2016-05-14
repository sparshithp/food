/**
 * Created by sparshithp on 5/13/16.
 */

var Area = require('../models/Area');
var Chef = require('../models/Chef');

exports.add = function(req, res){
    var reqArea = req.body.area;
    var reqCity = req.body.city;
    if(!reqArea || !reqCity){
        res.send({
            message: 'Area and city compulsory'
        });
        return;
    }else{
        Area.findOne({area: reqArea, city: reqCity}, function(err, area){
            console.log(area);
            if(err){
                res.send({message: "Error"});
            }else if(!area){
                res.send({message: "Area and City not Valid"})
            }else{
                var chef = new Chef();
                chef.firstName = req.body.firstName;
                chef.lastName = req.body.lastName;
                chef.sex = req.body.sex;
                chef.age = req.body.age;
                chef.description = req.body.description;
                chef.state = req.body.state;    //stateEnum
                chef.city = req.body.state;      //cityEnum
                chef.area = req.body.area;
                chef.areaId = area._id;
                chef.streetAddress = req.body.streetAddress;
                chef.cuisines = req.body.cuisines;
                chef.charity = req.body.charity;
                chef.phone = req.body.phone;

                chef.save(function(err){
                    if(err){
                        res.send({message: "Problem adding chef"})
                    }else{
                        res.send({message: "Successful"})
                    }
                });
            }
        });
    }

};

exports.getById = function(req, res){

    //Exclude contact details of chef?
    console.log(req.params.id);
    Chef.findOne({_id: req.params.id}, function(err, chef){
        if(err){
            res.send({message : "Problem retrieving"});
        }else{
            res.send({chef: chef});
        }
    });
};

exports.list = function(req, res){
    Chef.find({}, function(err, chefs){
        if(err){
            res.send({message: "Unsuccessful"});
        }else{
            res.send({chefs : chefs});
        }
    });
};