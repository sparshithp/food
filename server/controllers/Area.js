/**
 * Created by sparshithp on 5/16/16.
 */

var Area = require('../models/Area');

exports.add = function(req, res){
    var area = new Area();
    area.area = req.body.area;
    area.city = req.body.city;
    area.save(function(err){
        if(err){
            res.send({message : "err"});
        }else{
            res.send({message : "success"});
        }
    });
};

exports.list = function(req, res){
    Area.find({}, function(err, areas){
        res.send({areas: areas})
    });
};