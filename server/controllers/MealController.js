/**
 * Created by sparshithp on 5/13/16.
 */
var Meal = require('../models/Meal');
var Chef = require('../models/Chef');
var awsConstants = require('../constants/AwsConstants');

var AWS = require('AWS-sdk');
var fs = require('fs');
var formidable = require('formidable');

exports.add = function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = './';
    form.keepExtensions = true;

    var responseMessage;
    form.parse(req, function (err, fields, files) {

        var chefId = fields.chefId;
        var meal = new Meal();
        if (!chefId) {
            res.send({message: "Chef ID can't be empty !!"});
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

                responseMessage = "successful";

                if (!files || !files.image) {
                    responseMessage = "Successfull But Meal without Picture wont attract customers";
                } else {
                    addMealImageToS3Bucket(meal, files.image);
                }

               meal.save(function (err) {
                    if (err) {
                        console.log(err);
                        return res.send({problem: "err"});
                    }
                    res.send({message: responseMessage});
                });


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
            getMealsAndChefImageUrl(meals, function (err, meals) {

                if (err) {
                    console.log(err);
                }
                res.send({meals: meals});
            });
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

    var resp = {
        meal: Meal
    };

    Meal.findOne({_id: req.params.id}, function (err, meal) {
        if (err || !meal) {
            res.send({message: "Problem retrieving meal"});
        } else {

            resp.meal = meal;
            getMealAndChefImageUrlForMeal(meal, function (err, meal) {
                if (err) {
                    console.log(err);
                }
                res.send(resp);
            });

        }
    });
};

function getMealAndChefImageUrlForMeal(meal, callback) {

    var s3 = new AWS.S3();
    var bucketParams = {Bucket: awsConstants.MEALS_BUCKET};

    var s3Bucket = new AWS.S3({params: bucketParams});

    var mealImageKey = meal.chefId + "/" + meal.foodName;
    var urlParams = {Bucket: awsConstants.MEALS_BUCKET, Key: mealImageKey};
    s3Bucket.getSignedUrl('getObject', urlParams, function (err, url) {

        if (err) {
            console.log("error for meal image ", err);
        } else {
            console.log('the url of the meal image  is', url);
            meal.imageUrl = url;
        }
    });

    getChefImageUrl(meal.chefName+meal.chefAge, function (err, url) {
        if (err) {
            console.log("error for chef image ", err);
        } else {
            meal.chefImageUrl = url;
        }
        callback(null, meal);
    });


}

function getMealsAndChefImageUrl(meals, callback) {

    var s3 = new AWS.S3();
    var bucketParams = {Bucket: awsConstants.MEALS_BUCKET};

    var s3Bucket = new AWS.S3({params: bucketParams});

    for (var i = 0; i < meals.length; i++) {
        var meal = meals[i];
        var mealImageKey = meal.chefId + "/" + meal.foodName;
        var urlParams = {Bucket: awsConstants.MEALS_BUCKET, Key: mealImageKey};
       
        s3Bucket.getSignedUrl('getObject', urlParams, function (err, url) {

            if (err) {
                console.log("error for meal image ", err);
            } else {

                console.log('the url of the meal image  is', url);
                meal.imageUrl = url;
            }
        });

        getChefImageUrl(meal.chefName+meal.chefAge, function (err, url) {
            if (err) {
                console.log("error for chef image ", err);
            } else {
                meal.chefImageUrl = url;
            }

            if (i == (meals.length - 1)) {
                callback(null, meals);
            }
        });

    }
}

function getChefImageUrl(key, callback) {
    AWS.config.loadFromPath("aws-config.json");

    var s3 = new AWS.S3();
    var bucketParams = {Bucket: awsConstants.CHEF_BUCKET};

    var s3Bucket = new AWS.S3({params: bucketParams});

    var urlParams = {Bucket: awsConstants.CHEF_BUCKET, Key: key};
    s3Bucket.getSignedUrl('getObject', urlParams, function (err, url) {

        if (err) {
            callback(err, null);
        } else {

            console.log('the url of the chef image is', url);
            callback(null, url);
        }
    });

}

function addMealImageToS3Bucket(meal, image) {
    AWS.config.loadFromPath("aws-config.json");

    var s3 = new AWS.S3();
    var mealImageKey = meal.chefId + "/" + meal.foodName;
    var s3Bucket = new AWS.S3({params: {Bucket: awsConstants.MEALS_BUCKET}});

    fs.readFile(image.path, function (err, formImage) {

        var s3Image = {Key: mealImageKey, Body: formImage};
        s3Bucket.putObject(s3Image, function (err, s3Image) {
            if (err) {
                console.log('Error uploading meal image to s3 bucket ', err);
                return;
            } else {
                console.log('succesfully uploaded the image to s3 bucket '+ mealImageKey);
                fs.unlink(image.path, function (err) {
                    if (err) return console.log('Error while deleting from our temp ', err);
                    console.log('And deleted from our tmp location');
                });
                return;
            }
        });
    });

}
