let express = require('express');
let router = express.Router();
let Device = require("../models/device");
let User = require("../models/users");
let fs = require('fs');
let jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}


//endpoint for particle to get uv thresh 

router.post('/thresh', function(req, res, next) {
    console.log("device id seen by server: "+req.body.deviceId);
    console.log("apikey seen by server: "+req.body.apikey);
    Device.findOne({deviceId: req.body.deviceId, apikey: req.body.apikey}, function(err, device){
        console.log("Looking for device " + req.body.deviceId);
        if(err || !device){
          console.log(err);
          console.log("~~~~~~~~~~~~~~~");
            res.status(200).json(-1);
            
        }
        else{
            console.log("Looking for email" + device.userEmail);
            User.findOne({email: device.userEmail}, function(err, user){
                console.log(user.threshold);
                if(err || !user){
                    res.status(200).json(-1);
                    console.log(err);
                }
                else{
                    console.log({
                        success: true,
                        threshold: user.threshold
                    });
                    res.status(200).json(//{
                        //success: true,
                        //threshold: 
                          user.threshold
                    //}
);
                }
                
            });
        }
        
        
    }); 
});




// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
  let deviceId = req.params.devid;
  let responseJson = { devices: [] };

  if (deviceId == "all") {
    let query = {};
  }
  else {
    let query = {
      "deviceId" : deviceId
    };
  }
  
  Device.find(query, function(err, allDevices) {
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
      for(let doc of allDevices) {
        responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
      }
    }
    res.status(200).json(responseJson);
  });
});

router.post('/register', function(req, res, next) {
  let responseJson = {
    registered: false,
    message : "",
    apikey : "none",
    deviceId : "none"
  };
  let deviceExists = false;


  
  // Ensure the request includes the deviceId parameter
  console.log(typeof req.body.deviceId);
  if( !req.body.hasOwnProperty("deviceId")) {

    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }

  let email = "";
    
  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {

    try {

      let decodedToken = jwt.decode(req.headers["x-auth"], secret);

      email = decodedToken.email;

    }
    catch (ex) {

      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }
    
  // See if device is already registered
  Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
      return res.status(400).json(responseJson);
    }
    else {
      // Get a new apikey
     deviceApikey = getNewApikey();
      
      // Create a new device with specified id, user email, and randomly generated apikey.
      let newDevice = new Device({
        deviceId: req.body.deviceId,
        userEmail: email,
        apikey: deviceApikey
      });

      // Save device. If successful, return success. If not, return error message.
      newDevice.save(function(err, newDevice) {
        if (err) {
          responseJson.message = err;
          // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.registered = true;
          responseJson.apikey = deviceApikey;
          responseJson.deviceId = req.body.deviceId;
          responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
          return res.status(201).json(responseJson);
        }
      });
    }
  });
});

router.post('/ping', function(req, res, next) {
    let responseJson = {
        success: false,
        message : "",
    };
    let deviceExists = false;
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }
    
    // If authToken provided, use email in authToken 
    try {
        let decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }
    
    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/pingDevice",
       form: {
         access_token : particleAccessToken,
         args: "" + (Math.floor(Math.random() * 11) + 1)
        }
    });
            
    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceId + " pinged.";
    return res.status(200).json(responseJson);
});


router.delete('/remove',function(req,res,next){
    console.log("inside endpoint");

    //initialize response data 
    let responseJson = {
    removed: false,
    message : "",
    apikey : "none",
    deviceId : "none",
    data: "none"
    };


  //check req has deviceId 
  if(!req.body.hasOwnProperty("deviceId")) {
    
    responseJson.message = "Missing deviceId.";
    return res.status(400).json(responseJson);
  }
     console.log("devIdFollows");  
  console.log(req.body.deviceId); 
  let email = "";
    
  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {

    try {

      let decodedToken = jwt.decode(req.headers["x-auth"], secret);

      email = decodedToken.email;

    }
    catch (ex) {

      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }

  Device.remove({ deviceId: req.body.deviceId}, function(err, removed){
    if(err){
      
      responseJson.message = "there was an errror";
      // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
      return res.status(400).json(responseJson);
    }
    // if(removed ==null){
    //   responseJson.message = "device not removed";
    //   // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
    //   return res.status(400).json(responseJson);

    // }
    //  else {
          responseJson.removed = true;
          responseJson.deviceId = req.body.deviceId;
          responseJson.data = removed;
          responseJson.message = "Device ID " + req.body.deviceId + " was removed.";
          return res.status(201).json(responseJson);
       // }
  });
  });

module.exports = router;
