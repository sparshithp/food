/**
 * Created by sparshithp on 5/13/16.
 */

var Area = require('../models/Area');
var Chef = require('../models/Chef');
var Order = require('../models/Order');
var awsConstants = require('../constants/AwsConstants');
var uuid = require('uuid');

var AWS = require('AWS-sdk');
var fs = require('fs');
var formidable = require('formidable');

exports.add = function (req, res) {

    var form = new formidable.IncomingForm();
    form.uploadDir = './';
    form.keepExtensions = true;

    var responseMessage;
    form.parse(req, function (err, fields, files) {

        if (err) return res.end('form error');
        if (!files || !files.image) {
            return res.status(400).send({message: "Please upload an image"});
        }
        var reqArea = fields.areaId;

        if (!reqArea) {
            res.send({message: 'Area compulsory'});
            return;
        }

        Area.findById(reqArea, function (err, area) {
            if (err) {
                res.send({message: "Error"});
            } else if (!area) {
                res.send({message: "Area not Valid"})
            } else {
                var chef = new Chef();
                chef.name = fields.name;
                chef.sex = fields.sex;
                chef.age = Number(fields.age);
                chef.description = fields.description;
                chef.areaId = area._id;
                chef.address = fields.address;
                chef.cuisine = fields.cuisine;
                chef.phone = Number(fields.phone);
                chef.imageUrl = "";
                chef.key = uuid.v4();
                addChefToS3Bucket(chef, files.image, res);
            }

        });

    });

    form.on('error', function (err) {
        res.writeHead(400, {'content-type': 'text/plain'});
        res.end('error:\n\n' + util.inspect(err));
    });
};

exports.getById = function (req, res) {

    //Exclude contact details of chef?
    console.log(req.params.id);
    Chef.findOne({_id: req.params.id}, function (err, chef) {
        if (err) {
            console.log(err);
            res.status(400).send({message: "Problem retrieving"});
        } else {
            res.status(200).send({chef: chef});
        }

    });
};

exports.list = function (req, res) {
    Chef.find({}, function (err, chefs) {
        if (err) {
            res.send({message: "Unsuccessful"});
        } else {
            res.send({chefs: chefs});
        }
    });
};

exports.listOrdersByChefId = function (req, res) {
    Order.find({chefId: req.params.id}, function (err, orders) {
        if (err) {
            res.send(err);
        } else {
            res.send({orders: orders});
        }
    });
};

function addChefToS3Bucket(chef, image, res) {
    AWS.config.loadFromPath("aws-config.json");
    var s3Bucket = new AWS.S3({params: {Bucket: awsConstants.CHEF_BUCKET}});
    var urlParams = {Bucket: awsConstants.CHEF_BUCKET, Key: chef.key, Expires: 600000};


    fs.readFile(image.path, function (err, formImage) {
        var s3Image = {Key: chef.key, Body: formImage};
        s3Bucket.putObject(s3Image, function (err, etag) {
            if (err) {
                return res.status(400).send({message: "Error saving chef: s3 upload failure"});
            } else {
                console.log('succesfully uploaded the image to s3 bucket ');
                fs.unlink(image.path, function (err) {
                    if (err) {
                        return res.status(400).send({message: "Error while deleting from temp"});
                    } else {
                        console.log('And deleted from our tmp location');
                        s3Bucket.getSignedUrl('getObject', urlParams, function (err, url) {
                            if (err) {
                                return res.status(400).send({message: "Error getting URL"});
                            } else {
                                chef.imageUrl = url;
                                chef.save(function (err) {
                                    if (err) {
                                        return res.status(400).send({message: "Error updating chef with image url"});
                                    } else {
                                        return res.status(200).send({message: "Happy Cooking"});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}

exports.upload = function (req, res) {
    var form = new formidable.IncomingForm;
    form.keepExtensions = true;


    console.log("upload");
};
