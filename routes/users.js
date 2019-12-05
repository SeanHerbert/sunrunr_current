let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
let request = require('request');


var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);



/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
       res.status(401).json({success : false, message : "Can't connect to DB."});         
    }
    else if(!user) {
       res.status(401).json({success : false, message : "Email or password invalid."});         
    }
    else {
      bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
         if (err) {
           res.status(401).json({success : false, message : "Error authenticating. Contact support."});         
         }
         else if(valid) {
            var authToken = jwt.encode({email: req.body.email}, secret);
            res.status(201).json({success:true, authToken: authToken});
         }
         else {
            res.status(401).json({success : false, message : "Email or password invalid."});         
         }
         
      });
    }
  });
});


router.post('/token', function (req,res,next){
       var authToken = jwt.encode({email: req.body.email}, secret);
       res.status(201).json({success:true, authToken: authToken});  
});

/* Register a new user */
router.post('/register', function(req, res, next) {
   
   bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
         res.status(400).json({success : false, message : err.errmsg});         
      }
      else {
        var newUser = new User ({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash
        });
        
        newUser.save(function(err, user) {
          if (err) {
             res.status(400).json({success : false, message : err.errmsg});         
          }
          else {
             res.status(201).json({success : true, message : user.fullName + "has been created"});                      
          }
        });
      }
   });   
});

router.get('/logins', function (req,res,next){
        if (!req.headers["x-auth"]) {
          
          return res.status(401).json({success: false, message: "No authentication token"});
       }
      // try{
         var authToken = req.headers["x-auth"]; 
         var decodedToken = jwt.decode(authToken, secret);
         var email = decodedToken.email;
         request.post({
            headers: {'content-type' : 'application/json'},
            url: 'https://seanh-webauthn.duckdns.org/reg_sign_in_controller.php', 
            form: {"email":email,"logs":true}
          }, function(err,response,logins){
	    // console.log("first thing in logins request callback")
            // console.log("login data: "+logins[0]);
             logins = JSON.parse(logins);
             return res.status(200).json(logins); 
          }); 
       // }
       // catch(ex){
       //   console.log("invalid token");
       // }
});

router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
      if (!req.headers["x-auth"]) {
      
      return res.status(401).json({success: false, message: "No authentication token"});
   }

   try{
    var authToken = req.headers["x-auth"]; 
    var decodedToken = jwt.decode(authToken, secret);
    var email = decodedToken.email;
    userStatus ={};
    data = {"email":email,"acct":true};
    request.post({
    headers: {'content-type' : 'application/json'},
    url: 'https://seanh-webauthn.duckdns.org/reg_sign_in_controller.php', 
    form: {"email":email,"acct":true},
    //json:true
  }, function(err,result,user){
     user = JSON.parse(user);
     userStatus['success'] = true;
     userStatus['email'] = user.email;
     userStatus['fullname'] = user.fullName;
     userStatus['lastaccess'] = user.lastAccess;
     
     Device.find({ userEmail : decodedToken.email}, function(err, devices) {
            if (!err) {
               // Construct device list
               let deviceList = []; 
               for (device of devices) {
                 deviceList.push({ 
                       deviceId: device.deviceId,
                       apikey: device.apikey,
                 });
               }
               userStatus['devices'] = deviceList;
            }
            
               return res.status(200).json(userStatus);            
          });

  
    }); 

  }

 catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
    

   
    


   
  
      
   
});


module.exports = router;
