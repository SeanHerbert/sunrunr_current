var db = require("../db");

var activitySampleSchema = new db.Schema({
    longitude:    Number,
    latitude:     Number,
    speed:        Number,
    uv:           Number,
    id:           Number
    
});

var ActivitySample = db.model("ActivitySample", activitySampleSchema);

module.exports = ActivitySample;