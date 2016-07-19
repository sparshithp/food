/**
 * Created by sparshithp on 5/13/16.
 */

var User = require('../models/User');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config');
var Order = require('../models/Order');
var emailUtils = require('../notificationUtils/emailUtils');
var emaiConfig = require('../../email-config');

exports.login = function(req, res) {
    console.log(req.body);
    // middle parameter..
    //check err everywhere
    if(!req.body || !req.body.email){
        return res.status(400).send({message: 'Required fields missing'});
    }

    var email = req.body.email.toLowerCase();

    User.findOne({ email: email }, '+password', function(err, user){
        if(err){
            return res.status(400).send({ message: 'Encountered an error. Please try again' });
        }
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        user.comparePassword(req.body.password, function(err, isMatch){
            if (!isMatch) {
                return res.status(401).send({ message: 'Invalid credentials' });
            }
            res.send({
                user: user.email ,
                token: createToken(req, user)
            });
        });
    });
};

exports.signup = function(req, res){
    if(!req.body){
        res.status(400).send({message: 'Required fields missing'});
    }
    var fullName = req.body.fullName;
    var email = req.body.email;
    var password = req.body.password;
    var phone = req.body.phone;
    var address = req.body.address;
    var city = req.body.city;
    var zipCode = req.body.zipCode;
    var balance = 0;

    if(!fullName){
        res.status(400).send({message: 'Please input full name'});
        return;
    }
    if(!email){
        res.status(400).send({message: 'Please input valid email'});
        return;
    }
    if(!password){
        res.status(400).send({message: 'Please input valid password'});
        return;
    }
    if(!phone){
        res.status(400).send({message: 'Please input valid phone number'});
        return;
    }
    if(!address){
        res.status(400).send({message: 'Please input valid address'});
        return;
    }
    if(!city){
        res.status(400).send({message: 'Please input valid city'});
        return;
    }
    if(!zipCode){
        res.status(400).send({message: 'Please input valid zip code'});
        return;
    }

    email = email.toLowerCase();
    if(!validateEmail(email)){
        res.status(400).send({message: 'Please enter the correct email.'});
        return;
    }
    if(password.length <8){
        res.status(400).send({message: 'Password length should be minimum 8 characters.'});
        return;
    }


    var user = new User();
    user.fullName = fullName;
    user.email = email;
    user.password = password;
    user.phone = phone;
    user.address = address;
    user.city = city;
    user.zipCode = zipCode;
    user.balance = 0;


    User.findOne({email: email}, function(err, existingUser){
        if(err){
            res.status(400).send({message: 'Network error. Please try again'});
        } else if(existingUser){
            res.status(400).send({message: 'User already exists'});
        }else {
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    res.status(400).send({message: 'Error saving. Please try again'});
                } else {
                    res.send({token: createToken(req, user)});
                    
                    emailUtils.sendEmail(user.email, emaiConfig.REGISTERATION_SUBJECT, emaiConfig.REGISTERATION_MESSAGE);
                }
            });
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

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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

