let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let Activity = require("../models/activity")
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
let request = require('request');
let requestIp = require('request-ip');



var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);



/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.post('/signin', function(req, res, next) {
   
  //console.log(clientIp);
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
            var clientIp = requestIp.getClientIp(req);

            



            $.ajax({
                url: `http://ip-api.com/json/${clientIp}?fields=16576`,
                type: 'GET',
                //crossDomain:true,
                responseType: 'json',
                contentType: 'application/json',
                dataType: 'json'
              })
                .done(function(data,textStatus,jqXHR){
                  if(data.status=="success"){
                      console.log("lat followed by lon from ip-api");
                      console.log(data.lat);
                      console.log(data.lon);
                      res.status(201).json({success:true, authToken: authToken, lat: data.lat, lon:data.lon }); 
                  }
                  else{
                    res.status(201).json({s:true, authToken: authToken, userIpAddr: clientIp });
                  }
                })
                .fail(function(jqXHR, textStatus, errorThrown){
                      res.status(201).json({su:true, authToken: authToken, userIpAddr: clientIp });

                });





            
      //console.log(clientIp);
            
         }
         else {
            res.status(401).json({success : false, message : "Email or password invalid."});         
         }
         
      });
    }
  });
});



router.post('/update', function(req, res, next) {

  //check for authtoken
  if (!req.headers["x-auth"]) {
          
          return res.status(401).json({success: false, message: "No authentication token"});
       }

  //check for params
  if(!req.body.hasOwnProperty('e')){
      return res.status(400).json({success: false, message: "missing email"});  
  }
  if(!req.body.hasOwnProperty('n')){
      return res.status(400).json({success: false, message: "missing name"});  
  }
  if(!req.body.hasOwnProperty('p')){
      return res.status(400).json({success: false, message: "missing password"});  
  }

  //set query params
  var em =req.body.e;
  var na = req.body.n;
  var pw = req.body.p;

  try{
    //decode tokenized email for update query
    var authToken = req.headers["x-auth"]; 
    var decodedToken = jwt.decode(authToken, secret);
    var t_email = decodedToken.email;



    //find use associated with that email
    User.findOne({email: t_email}, function(err, user) {
    //if error return
    if (err) {
       res.status(401).json({success : false, message : "Can't connect to DB."});         
    }

    //user not found
    else if(!user) {
       res.status(401).json({success : false, message : "user no existe!."});         
    }

    //set query params
    else {
      //initialize  query 
      query = {};

      //assign email to query if email non-whitespace 
      if(em.replace(/\s/g, '').length){
        query["email"] = em;
        
        }

      //assign name to query if non-whitespace   
      if(na.replace(/\s/g, '').length){
        query["fullName"] = na;
        }

      //hash password if non-whitespace 
      if(pw.replace(/\s/g, '').length){
        //hash it, store it 
        bcrypt.hash(pw, 10, function(err, hash) {
            //if error hashing return
            if (err) {
               res.status(401).json({success : false, message : "not authorized"});         
            }


            else {
              //assign query password hash for update 
              query["passwordHash"] = hash;

              //stringify query
              var jsonQuery = JSON.stringify(query);
              jsonQuery = JSON.parse(jsonQuery);
              
              //update user with tokenized email and query 
              User.update({email:t_email},{$set:jsonQuery},function(err,result){

                  // if error return 
                  if(err){
                    res.status(401).json({success : false, message : "couldn't update user. but inside bcrpyt hash"});
                  }
                  else{
                    //if email in query update it in all activities, associated with the update paramter of tokenized email 
                    if(query["email"]){

                      //stringify query 
                      query2 = JSON.stringify({userEmail:query["email"]});
                      query2 = JSON.parse(query2);
                      console.log(query2);
                      //update all activites with thte new eeamil 
                      Activity.updateMany({userEmail:t_email},{$set:query2},function(err1,res1){
                          //if error return 
                          if(err){
                              res.status(400).json({success : false, message : "porblem with updating activites"});  
                          }
                          else{
                             //if activites updated, update devices as well 
                             Device.updateMany({userEmail:t_email},{$set:query2},function(err2,res2){
                          //if error return 
                          if(err){
                              res.status(400).json({success : false, message : "porblem with updating devices"});  
                          }

                          else{
                            //create new authToken for with new email if everything was successful. 
                            //Send it to be set in local storage client side so the user wont be kickced out
                            var newToken = jwt.encode({email: query["email"]}, secret);
                            res.status(201).json({success : true, message:"updated email throughout entire db", userRes : result, activityRes: res1, devRes: res2, newToken: newToken});
                          }
                              
                          }

                      ); 
                          }
                              
                          }

                      ); 

                      
                    }
                    //no email present, password successfully updated 
                    else{res.status(201).json({success : true, message : result});}
                    
                  }

              });
              
              
           
            }
        });   
        
        }
        else{
          //no hash update users 

          //stringify update params 
          var jsonQuery = JSON.stringify(query);
          jsonQuery = JSON.parse(jsonQuery);

          //update user
          User.update({email:t_email},{$set:jsonQuery},function(err,result){
              //if error return 
               if(err){
                    res.status(401).json({success : false, message : "couldn't update. But user not trying to update pwd"});
                  }


               if(query["email"]){
                  //update devices and activities

                     //stringify query
                     query2 = JSON.stringify({userEmail:query["email"]});
                      query2 = JSON.parse(query2);
                      console.log(query2);

                      //update acts
                      Activity.updateMany({userEmail:t_email},{$set:query2},function(err1,res1){
                        // if error return 
                          if(err){
                              res.status(400).json({success : false, message : "porblem with updating activites"});  
                          }
                          else{
                             //update devices
                             Device.updateMany({userEmail:t_email},{$set:query2},function(err2,res2){
                              //if err return 
                          if(err){
                              res.status(400).json({success : false, message : "porblem with updating devices"});  
                          }

                          else{
                            //return new authToken
                            var newToken = jwt.encode({email: query["email"]}, secret);
                            res.status(201).json({success : true, message:"updated email throughout entire db", userRes : result, activityRes: res1, devRes: res2, newToken: newToken});
                          }
                              
                          }

                      ); 
                          }
                              
                          }

                      ); 


                }
              else{
                //just return result
                res.status(201).json({success : true, userRes : result});
              }



          });
          
         

        }
     
    }
  });

    


  }
  catch(ex){
    return res.status(401).json({success: false, message: "Invalid authentication token"}); 
  }
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








router.put("/threshold", function(req, res){
     if (!req.headers["x-auth"]) {
        return res.status(401).json({success: false, message: "No authentication token"});
    }

    var authToken = req.headers["x-auth"];
    try {
        var token_dec = jwt.decode(authToken, secret);
        let query={
            "email" : token_dec.email
        }
        User.update(query, { $set: { threshold: req.body.threshold }}, function (err, data){
            if(err){
                return res.status(400).json({success: false, message: "Error updating thresh"});
            }
            else{
                return res.status(200).json({success : true, changeData: data}); 
            }
        });
    } catch (e) {
        res.status(400).send(e);
    }
});













router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
      
      User.findOne({email: decodedToken.email}, function(err, user) {
         if(err) {
            return res.status(400).json({success: false, message: "User does not exist."});
         }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
	    userStatus['thresh'] = user.threshold;
            
            // Find devices based on decoded token
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
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

module.exports = router;
