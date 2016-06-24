/**
 * Created by sparshithp on 5/13/16.
 */

var User = require('../models/User');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config');
var Order = require('../models/Order');


exports.login = function(req, res) {
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
            res.send({
                user: user.email ,
                token: createToken(req, user)
            });
        });
    });
};

exports.signup = function(req, res){
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
};

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

/* other user apis */

exports.listOrdersByUserId = function(req, res){
	Order.find({consumerId: req.params.id}, function(err, orders){
        if(err){
            res.send({message: "error"});
        }else{
            res.send({orders: orders});
        }
    });
};

