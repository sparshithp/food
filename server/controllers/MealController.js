/**
 * Created by sparshithp on 5/13/16.
 */
var Meal = require('../models/Meal');
var Chef = require('../models/Chef');
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
        console.log(req.body);
        if(!files.image){
            console.log("no files")
        }
        if (!files || !files.image) {
            return res.status(400).send({message: "Please upload an image"});
        }

        var chefId = fields.chefId;
        var meal = new Meal();
        if (!chefId) {
            res.status(400).send({message: "Chef ID can't be empty !!"});
            return;
        }
       
        Chef.findOne({_id: chefId}, function (err, chef) {
            if (err) {
                res.send({message: "error"});
            } else if (!chef) {
                res.send({message: "Can't find chef !!"});
            } else {
                meal.chefId = chefId;
                meal.areaId = chef.areaId;
                meal.spiceLevel = fields.spiceLevel;
                meal.price = fields.price;
                meal.totalCount = fields.count;
                meal.remainingCount = fields.count;
                meal.foodName = fields.foodName;
                meal.cuisine = fields.cuisine;
                meal.status = 'ACTIVE';
                meal.chefImageUrl = chef.imageUrl;
                meal.key = uuid.v4();

                var availableTime = fields.availableTime;
                if (availableTime == null) {
                    meal.availableTime = new Date().getTime() + (4 * 60 * 60 * 1000);
                }else{
                	meal.availableTime = new Date(availableTime);
                }

                var orderBeforeTime = fields.orderBeforeTime;
                if (orderBeforeTime == null) {
                    orderBeforeTime = new Date().getTime() + (2 * 60 * 60 * 1000); // by default setting order before time 2 hours from now
                }else{
                	meal.orderBeforeTime = new Date(orderBeforeTime);
                }

                if (meal.orderBeforeTime > meal.availableTime) {
                    meal.orderBeforeTime = new Date().getTime() + (2 * 60 * 60 * 1000);
                    meal.availableTime = new Date().getTime() + (4 * 60 * 60 * 1000);
                }


                addMealToS3Bucket(meal, files.image, res);


            }
        });

    });
};

exports.list = function (req, res) {
    console.log("list");
    Meal.find({}, function (err, meals) {
        if (err) {
            res.send({message: "error"});
        } else {
            res.send({meals: meals});
        }
    })
};

exports.remove = function (req, res) {
    console.log("remove");

    var mealId = req.params.mealId;

    if (!mealId) {
        res.send({message: "mealId is missing"});
        return;
    }

    Meal.findOne({_id: mealId}, function (err, meal) {
        if (err) {
            res.send({message: "error"});
            return;
        }
        if (!meal) {
            console.log("Could not find meal");
            res.send({message: "Sorry all meals sold out !!"});
            return;
        }

        meal.status = "INACTIVE";
        meal.save(function (err) {
            if (err) {
                console.log("error while saving removed meal");
                res.send({message: "Sorry all meals sold out !!"});
            } else {
                if (meal.orderedCount >= 1) {
                    res.send({message: "You have received " + meal.orderedCount + " orders. Your rating will be reduced by doing so ."});
                } else {
                    console.log("removed meal");
                }
            }
        });
    });
};

exports.listByAreaId = function (req, res) {
    console.log("listByAreaId");

    var query = Meal.find(
        {
            areaId: req.params.areaId,
            status: "ACTIVE",
            availableTime: {$gte: new Date()}
        });

    query.exec(function (err, meals) {
        if (err) {
            res.send({message: "error"});
        } else {
        	console.log("found " + meals.length);
                res.send({meals: meals});
        }
    });
};

exports.listByFoods = function (req, res) {

    Meal.aggregate([
        {
            $match: {
                areaId: req.params.areaId,
                status: "ACTIVE"
            }
        },
        {
            $group: {
                _id: {
                    "foodId": "$foodId",
                    "foodName": "$foodName"
                },
                chefs: {$sum: 1},
                minPrice: {$min: "$price"},
                maxPrice: {$max: "$price"}
            }
        }
    ], function (err, meals) {
        if (err) {
            res.send({message: "error"});
            return;
        }

        res.send({meals: meals});
    });
};

exports.listByChefsForFood = function (req, res) {

    var query = Meal.find({"areaId": req.params.areaId, "foodId": req.params.foodId}); //hardcoded

    query.exec(function (err, meals) {
        if (err) {
            res.send({message: "error"});
        } else {
            res.send({meals: meals});
        }
    });
};

exports.listByChefs = function (req, res) {

    console.log(req.params.chefId);

    var query = Meal.find({chefId: req.params.chefId});
    query.exec(function (err, meals) {
        if (err) {
            res.send({message: "error"});
        } else {
            res.send({meals: meals});
        }
    });
};

exports.getMealInfo = function (req, res) {

    console.log(req.params.id);
    Chef.findOne({_id: req.params.id}, function (err, meal) {
        if (err) {
            console.log(err);
            res.status(400).send({message: "Problem retrieving"});
        } else {
            res.status(200).send({meal: meal});
        }

    });
};

function addMealToS3Bucket(meal, image, res) {
    AWS.config.loadFromPath("aws-config.json");
    var s3Bucket = new AWS.S3({params: {Bucket: awsConstants.MEALS_BUCKET}});
    var urlParams = {Bucket: awsConstants.MEALS_BUCKET, Key: meal.key, Expires: 60000};


    fs.readFile(image.path, function (err, formImage) {
        var s3Image = {Key: meal.key, Body: formImage};
        s3Bucket.putObject(s3Image, function (err, etag) {
            if (err) {
                return res.status(400).send({message: "Error saving meal: s3 upload failure"});
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
                                meal.imageUrl = url;
                                meal.save(function (err) {
                                    if (err) {
                                        return res.status(400).send({message: "Error updating meal with image url"});
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
