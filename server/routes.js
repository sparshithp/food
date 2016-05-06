var path = require('path');
var qs = require('querystring');
var express = require('express');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');
var config = require('../config');
var User = mongoose.model('User');
var Chef = require('./models/Chef');
var Food = require('./models/Food');
var Meal = require('./models/Meal');

module.exports = function(app){

  app.get('/api/me', ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user){
      res.send(user);
    })
  });

  app.put('/api/me', ensureAuthenticated, function(req, res){
    console.log(req.user);
    User.findById(req.user, function(err, user){
      if(!user){
        return res.status(400).send({ message: 'User not found' });
      }
      user.displayName = req.body.displayName || user.displayName;
      user.email = req.body.email || user.email;
      user.save(function(err){
        res.status(200).end();
      });
    });
  });

  ////////////////////////////////////////////////////////////////////////////////
  // Log in with Email ///////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  app.post('/auth/login', function(req, res) {
    // middle parameter..
//check err everywhere
    User.findOne({ email: req.body.email }, '+password', function(err, user){
      if (!user) {
        return res.status(401).send({ message: 'Wrong email and/or password' });
      }

      user.comparePassword(req.body.password, function(err, isMatch){
        if (!isMatch) {
          return res.status(401).send({ message: 'Wrong email and/or password' });
        }
        res.send({ token: createToken(req, user) });
      });
    });
  });

  ////////////////////////////////////////////////////////////////////////////////
  // Create Email and Password Account ///////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  app.post('/auth/signup', function(req, res){
    console.log(req.body);
    //check fullname
      //check email
      //check password
      //check phone
      //check address
      //check postal code
      //check city
    //check existing user
    var user = new User();
    user.fullName = req.body.fullName;
    user.email = req.body.email;
    user.password = req.body.password;
    user.phone = req.body.phone;
    user.address = req.body.address;
    user.city = req.body.city;
    user.zipCode = req.body.zipCode;
    user.balance = 0;
    user.chefProfile = null;

    user.save(function(err) {
      if(err){
        res.send({message: "Problem saving"})
      }else {
        res.send({token: createToken(req, user)})
      }
    });
  });


////////////////////////////////////////////////////////////////////////////////
// Meal listing and ordering ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

  app.get('/meal/list', function(req, res){

  });

////////////////////////////////////////////////////////////////////////////////
// Food ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
  app.post('/food/add', function(req, res){
    var food = new Food();
    food.name = req.body.name;
    food.cuisine = req.body.cuisine;
    food.diet = req.body.diet;
    food.mealType = req.body.mealType;
    food.spiceLevel = req.body.spiceLevel;

    food.save(function(err){
      if(err){
        res.send({message: "Problem adding food"})
      }else{
        res.send({message: "Successful"})
      }
    });
  });

  app.get('/food/get/:id', function(req, res){

    //Exclude contact details of chef?
    Food.findById(req.params.id, function(err, food){
      if(err){
        res.send({message : "Problem retrieving"});
      }else{
        res.send(food);
      }
    });
  });

  app.get('/food/list', function(req, res){
    Foods.find({}, function(err, foods){
      if(err){
        res.send({message: "Unsuccessful"});
      }else{
        res.send({foods : foods});
      }
    });
  });

////////////////////////////////////////////////////////////////////////////////
// Chef ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
  app.post('/chef/add', function(req, res){
    var chef = new Chef();
    chef.firstName = req.body.firstName;
    chef.lastName = req.body.lastName;
    chef.sex = req.body.sex;
    chef.age = req.body.age;
    chef.description = req.body.description;
    chef.state = req.body.state;    //stateEnum
    chef.city = req.body.state;      //cityEnum
    chef.area = req.body.area;
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
  });

  app.get('/chef/get/:id', function(req, res){

    //Exclude contact details of chef?
    Chef.findById(req.params.id, function(err, chef){
      if(err){
        res.send({message : "Problem retrieving"});
      }else{
        res.send(chef);
      }
    });
  });

  app.get('/chef/list', function(req, res){
    Chef.find({}, function(err, chefs){
      if(err){
        res.send({message: "Unsuccessful"});
      }else{
        res.send({chefs : chefs});
      }
    });
  });

////////////////////////////////////////////////////////////////////////////////
// Meal ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

  app.get('/meal/add', function(req, res){
      var meal = new Meal();
      meal.foodId = req.body.foodId;
      meal.foodName = req.body.foodName;
      meal.chefId = req.body.chefId;
      meal.chefName = req.body.chefName;
      meal.price = req.body.price;
      meal.spiceLevel = req.body.spiceLevel;
      meal.cuisine = req.body.cuisine;
      meal.areaName = req.body.areaName;
      meal.areaId = req.body.areaId;

      meal.save(function(err){
         if(err){
             res.send({problem : "err"});
         }else{
             res.send({message : "successful"});
         }
      });
  });

};




////////////////////////////////////////////////////////////////////////////////
// Login Required Middleware ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.TOKEN_SECRET);

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  console.log(payload);
  req.user = payload.sub;
  next();
}

////////////////////////////////////////////////////////////////////////////////
// Generate JSON Web Token /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function createToken(req, user) {
  var payload = {
    iss: req.hostname,
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}