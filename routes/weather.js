let express = require('express');
let router = express.Router();
let fs = require('fs');
let jwt = require("jwt-simple");
let Device = require("../models/device");
let Activity = require("../models/activity");
let User = require("../models/users");
let request = require('request');

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

let secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

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

//makes 3 calls to owm for forecast, current UVI and forecast UVI data
router.get("/forecast/:lat/:lon", function(req, res) {
    let responseJson = {
        success: true,
        message: "",
        weatherData: null,
        currUV : null,
        arrayUV : null

        
    };
    lat = 32.253460;
    lon = -110.911789;
    if(req.params.lat){
     lat = req.params.lat;  
    }
    if(req.params.lon){
     lon = req.params.lon;  
    }
     
    console.log(lat);
    console.log(lon);
    var decodedToken = authenticateAuthToken(req);
    if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    
    console.log("right before ajax");
    
    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=092b2e289298b368fb3c48b8b747b8af`,
        type: 'GET'
    //crossDomain:true,
    // responseType: 'json',
    // contentType: 'application/json',
    // dataType: 'json'
  })
    .done(forecastHandler)
    .fail(errorHandler);


    function forecastHandler(forecastData, textSatus, jqXHR){
        console.log("in forecast success");
        responseJson.weatherData = forecastData; 
            $.ajax({
                url: `http://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=092b2e289298b368fb3c48b8b747b8af`,
                type: 'GET'
            })
            .done(uvArrayHandler)
            .fail(errorHandler);   
        //return res.status(200).json(responseJson);   
    }

    function uvArrayHandler(uvArrayData, textSatus, jqXHR){
        console.log("in uvArray success");
        responseJson.arrayUV = uvArrayData; 
            $.ajax({
                url: `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&units=imperial&appid=092b2e289298b368fb3c48b8b747b8af`,
                type: 'GET'
            })
            .done(currUVHandler)
            .fail(errorHandler);   
        //return res.status(200).json(responseJson);   
    }

    function currUVHandler(currUVData, textSatus, jqXHR){
        console.log("in success");
        responseJson.currUV = currUVData; 
            
        return res.status(200).json(responseJson);   
    }

    function errorHandler(jqXHR, textStatus, errorThrown){
        console.log("in fail");
        responseJson.message = "error getting weather data";
        if(responseJson.weatherData){
            return res.status(200).json(responseJson); 
        }
        return res.status(400).json(responseJson); 
         

    }

});

module.exports = router;
