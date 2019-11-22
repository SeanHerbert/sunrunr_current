var db = require("../db");
ActivitySample = require('./activitySample.js');

ActivitySampleSchema = db.model("ActivitySample").schema;

var activitySchema = new db.Schema({ 
    start:        { type: Date, default: Date.now },
    type:         String,
    id:          Number,
    samples:      {type: [ActivitySampleSchema], default:[]},
    duration:          String,
    deviceId:     String,
    apikey:       String,
    userEmail:    String,
    uv:           String,
    weather:      {temperature: Number, humidity: Number}
    
});

var Activity = db.model("Activity", activitySchema);

module.exports = Activity;