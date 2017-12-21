var passport = require('passport');
var User = require('../models/User');
var { check, validationResult } = require('express-validator/check');
var { matchedData, sanitize } = require('express-validator/filter');
var api = require('./api');
/**
 * GET /
 */
exports.index = function (req, res) {
  api.api(req, res).then(function (data) {
    console.log(data);
    res.locals.projects = data;
    res.render('home', {
      title: 'Home'
    });
  })
};

