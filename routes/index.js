var passport = require('passport');
var User = require('../models/User');
var api = require('./api');
/**
 * GET /
 */
exports.index = function (req, res) {
  console.log(req.query.sort);
  if (req.query.sort == 'oldest'){
    api.api(req, res).then(function (data) {
      res.locals.projects = data.sort((a, b) => { return -1 });
      res.render('home', {
        title: 'Home'
      });
    })
  }else{
    api.api(req, res).then(function (data) {
      res.locals.projects = data.sort((a, b) => { return 1 });
      res.render('home', {
        title: 'Home'
      });
    })
  }
};

