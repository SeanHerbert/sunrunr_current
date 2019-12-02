let express = require('express');
let router = express.Router();
let fs = require('fs');
let jwt = require("jwt-simple");
let Device = require("../models/device");
let Activity = require("../models/activity");
let User = require("../models/users");
let request = require('request');

// Secret key for JWT
let secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();
let authenticateRecentEndpoint = true;
var num = 1;
var numSamples = 0;
var samples = [];
var walkingMax = 4.0;
var runningMax = 10.0;
var endFlag = false;
var type = "default";
var endTime = 0;
var realStart = 0;
global.userEmail = "";

function authenticateAuthToken(req) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return null;
    }
   
    let authToken = req.headers["x-auth"];
   
    try {
        let decodedToken = jwt.decode(authToken, secret);
        return decodedToken;
    }
    catch (ex) {
        return null;
    }
}

router.post("/record", function(req, res) {
		
         let responseJson = {
         success : false,
         message : ""
        
     };
      
	
	
	
	 if( !req.body.hasOwnProperty("data") ) {
         responseJson.message = "Request missing data parameter.";
         return res.status(422).send(JSON.stringify(responseJson.message));
     }
    
     if( !req.body.hasOwnProperty("apikey") ) {
         responseJson.message = "Request missing apikey parameter.";
         return res.status(422).send(JSON.stringify(responseJson.message));
     }
	
	 if( !req.body.hasOwnProperty("deviceId") ) {
         responseJson.message = "Request missing apikey parameter.";
         return res.status(422).send(JSON.stringify(responseJson.message));
     }



	
	
	 Device.findOne({
        	//apikey: req.body.apikey,
		 deviceId: req.body.deviceId
		 		 }, function(err,device){
							 if (err) {
            						 responseJson.success = false;
            						 responseJson.message = "Error accessing db.";
            						 return res.status(503).send(JSON.stringify(responseJson));
        						 }
						 if(!device){
							 responseJson.success = false;
							 responseJson.message = "Device not registered or incorrect apikey or not associated with this account";

							 return res.status(422).send(JSON.stringify(responseJson.message));

							 }
							
							userEmail = device.userEmail;
        			

							


				
				
		 



	
   
     
	
		
	
	 var data = req.body.data.split(",");
	 var lat;
	 var lon;
	 var speed;
	 var uv;
	 var sample;
	 
	 if(data[data.length-1]=="stop"){
		data.pop();
		endFlag =true;
	 }
	
	 if(data[0]>0){
		 start = data[0];
		 start = start*1000;
		 realStart = start;
	 }
	 for(let i = 4;i<data.length;i+=5){
			 lat = data[i-3];
			 lon = data[i-2];
			 speed = data[i-1];
			 uv = data[i];
			 sample = new ActivitySample({
						 longitude: lon,
						 latitude:  lat,
						 speed:     speed,    
						 uv:        uv,
						 id:        num
						
					 });
			samples.push(sample);
			numSamples++;	
	 }


	 
	var weatherLon = samples[0].longitude;
	var weatherLat = samples[0].latitude;


		

		if(endFlag == true && samples.length>0){
			

		 var avgSpeed = 0;
		
		 for(let i=0;i<samples.length;i++){
				 avgSpeed+=samples[i].speed;
		 }
		 avgSpeed = avgSpeed/samples.length;
		
		 if(avgSpeed> 0 && avgSpeed <= walkingMax){
			 type = "walking";
		 }
		
		 if(avgSpeed> walkingMax && avgSpeed <= runningMax){
			 type = "running";
		 }
		
		 if(avgSpeed> runningMax){
			 type = "biking";
		 }

		 var avgUV = 0;

		 for(let i=0;i<samples.length;i++){
		 	avgUV +=samples[i].uv;
		 }
		 avgUV = avgUV/samples.length;



			 endTime = realStart + (samples.length * 15000);
			 var duration = Number(endTime-realStart);
			 if(duration <60000){
			 	duration = duration/1000;
			 	duration = duration + " seconds";
			 }
			 else if(duration>60000 && duration <3600000){
			 	duration = duration/1000;
			 	var secs =  duration % 60;
			 	duration = duration -secs;
			 	duration = duration / 60;
			 	duration = duration + " minutes " + secs+ " seconds";
			 }
			 else{
			 	duration = duration/1000;
			 	var secs =  duration % 60;
			 	duration = duration -secs;
			 	duration = duration/60; //min
			 	var mins = duration % 60;
			 	duration = duration - mins;
			 	durartion = duration /60;
			 	duration  = duration +" hours " +mins+" minutes "+secs+" secs";


			 }
			 endTime = Date(endTime);
			
			 realStart = Date(realStart);
			 			 
			//change lat and lon to come from device
	 request({
        method: "GET",
        uri: "http://api.openweathermap.org/data/2.5/weather?lat="+weatherLat+"&lon="+weatherLon+"&units=imperial&appid=092b2e289298b368fb3c48b8b747b8af",
       
     },function(err, data){
		 //console.log(JSON.parse(data.body));
		 var temp = JSON.parse(data.body).main.temp;
		 var hum = JSON.parse(data.body).main.humidity;
		//console.log("weather data should follow:"+ temp + " "+hum);		
		  			 var activity = new Activity({
								 start:        realStart,
								 type:         type,
								 id:           num,
								 samples:      samples,
								 duration:     duration,     
								 deviceId:     req.body.deviceId,
								 apikey:       req.body.apikey,
								 userEmail:     userEmail,  
								 uv:            avgUV,
								 weather:      {temperature: temp, humidity: hum}  
								
							 });
console.log("weather data should follow:"+ activity.weather.temperature + " "+activity.weather.humidity);

			 samples = [];
			 numSamples = 0;
			 num++;
			 end = false;
			 realStart = 0;
			 endTime = 0;
			 type = "default";
			
			 activity.save(function(err, newActivity) {
				 if (err) {
					 responseJson.status = "ERROR";
					 responseJson.message = "Error saving data in db." + err;
					 return res.status(503).send(JSON.stringify(responseJson));
				 }
			
				 responseJson.success = true;
				 return res.status(201).send(JSON.stringify(responseJson));
				
				 });
		
	 });



		}
	
			     

	
    

        
	//console.log(req.body.data);
	//return res.status(201).send(JSON.stringify("yellow"));
 
});

});

// GET: Returns all Activites first reported in the previous specified number of days
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/summary/:days", function(req, res) { 
    let days = req.params.days;
        let responseJson = {
        success: true,
        message: "",
        activities: [],
    };
    
    if (authenticateRecentEndpoint) {
        var decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    

    // Check to ensure the days is between 1 and 365 (inclsuive), return error if not
    if (days < 1 || days > 365) {
        responseJson.success = false;
        responseJson.message = "Invalid days parameter.";
        return res.status(200).json(responseJson);
    }
    
    // Find all potholes reported in the spcified number of days
    let activitiesQuery = Activity.find({
    //    "date": 
     //   {
     //       $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)))
      //  },

	"userEmail": decodedToken.email
	
    }).sort({ "date": -1 });
    
    
    activitiesQuery.exec({}, function(err, activities) {
	
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
        else {  
            let numActivities = 0;
			
            for (let a of activities) {
                // Add pothole data to the respone's potholes array
                numActivities++; 
		
                responseJson.activities.push({
                    type: a.type,
					date: a.date,
					start: a.start,
					duration: a.duration,
					uv: a.uv,
					weather: a.weather,
					id: a.id
                    
                });
            }
            responseJson.message = "In the past " + days + " days, " + numActivities + " activities have been recorded.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
    })
});
router.get("/detail/:number", function(req, res) {
    //console.log("ID FROM QUEREY "+id);
        let responseJson = {
	      samples: [],
		type:""
    };
    if (authenticateRecentEndpoint) {
        var decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    // Find all potholes reported in the spcified number of days
    let activitiesQuery = Activity.find({
      "id":Number(req.params.number),
      "userEmail": decodedToken.email
    });
        //console.log(typeof(Number(req.params.number)));
        //console.log(activitiesQuery);
        //console.log("Number:"+req.params.number+" userEmail:"+decodedToken.email);
        //console.log(JSON.stringify(activitesQuery));
        //console.log("Before activitesQuerey.exec"); 
    activitiesQuery.exec({}, function(err, activities) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(200).send(JSON.stringify(responseJson));
        }
        else { 
            for (let a of activities) {
		responseJson.type = a.type;
                for (let sample of a.samples){
                responseJson.samples.push({
                          start:sample.start,
                          longitude:sample.longitude,
                          latitude:sample.latitude,
                          speed:sample.speed,
                          uv:sample.uv
                });
                }
                if(a.samples.length == 0){
                        responseJson.samples.push({
                                start:0,
                                longitude:0,
                                latitude:0,
                                speed:0,
                                uv:0

                        });
                }
            }
                           return res.status(200).send(JSON.stringify(responseJson));
        }
    });
});



module.exports = router;
