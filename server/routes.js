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
var Area = require('./models/Area');
var Order = require('./models/Order');
var userController = require('./controllers/UserController');
var mealController = require('./controllers/MealController');
var foodController = require('./controllers/FoodController');
var chefController = require('./controllers/ChefController');
var areaController = require('./controllers/AreaController');
var orderController = require('./controllers/OrderController');
var deliveryController = require('./controllers/DeliveryController');

module.exports = function(app){

    app.get('/api/me', ensureAuthenticated, function(req, res) {
        User.findById(req.user, function(err, user){
            res.send(user);
        });
    });

    app.put('/api/me', ensureAuthenticated, function(req, res){
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
// User ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

    app.post('/auth/login', userController.login);

    app.post('/auth/signup', userController.signup);
    
    app.get('/user/:id/myOrders', userController.listOrdersByUserId);


////////////////////////////////////////////////////////////////////////////////
// Food ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
    app.post('/food/add', foodController.add);

    app.get('/food/list', foodController.list);

    app.get('/food/:id', foodController.getById);


////////////////////////////////////////////////////////////////////////////////
// Chef ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
     app.post('/chef/add', chefController.add);

     app.get('/chef/list', chefController.list);

     app.get('/chef/:id/myOrders', chefController.listOrdersByChefId);

     app.get('/chef/:id', chefController.getById);

     

////////////////////////////////////////////////////////////////////////////////
// DeliveryBoy ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
      app.post('/deliveryBoy/add', deliveryController.add);

      app.get('/deliveryBoy/list', deliveryController.list);

      app.get('/deliveryBoy/:id/showMeals', deliveryController.showMealsInMyCoverage);

      app.get('/deliveryBoy/:id', deliveryController.getById);
      

////////////////////////////////////////////////////////////////////////////////
// Meal ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

      app.post('/meal/add', mealController.add);

      app.post('/meal/remove/:mealId', mealController.remove);
    
      app.get('/meal/list/chefs/:chefId', mealController.listByChefs); // this has to be first api, coz of url meal/list 

      app.get('/meal/list/foods/chefs/:areaId/:foodId', mealController.listByChefsForFood); // how to pass 2 params

      app.get('/meal/list/foods/:areaId', mealController.listByFoods);
    
      app.get('/meal/list/:areaId', mealController.listByAreaId);

      app.get('/meal/list', mealController.list);
      
      app.get('/meal/:id', mealController.getMealInfo);
      
    


////////////////////////////////////////////////////////////////////////////////
// Order ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

    app.post('/order/create', orderController.create);
    
    app.get('/order/:id', orderController.getById);

    app.post('/order/update/:id', orderController.updateOrder);

    app.get('/order/track/:id', orderController.trackOrder);


////////////////////////////////////////////////////////////////////////////////
// Area ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

    app.post('/area/add', areaController.add);

    app.get('/area/list', areaController.list);


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