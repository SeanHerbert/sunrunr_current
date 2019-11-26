var express = require('express');
var router = express.Router();

/* GET home page. */
console.log("here");
router.get('/', function(req, res, next) {
  res.render('fitnessPalIndex', { title: 'FitnessPal' });
});

module.exports = router;
