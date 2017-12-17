var passport = require('passport');
var User = require('../models/User');
var { check, validationResult } = require('express-validator/check');
var { matchedData, sanitize } = require('express-validator/filter');
var api = require('./api');

/**
 * POST /login
 */
exports.loginPost = function (req, res, next) {

  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('error', errors.array());
    return res.redirect('/');
  }

  passport.authenticate('local', function (err, user, info) {
    if (!user) {
      req.flash('error', info);
      return res.redirect('/')
    }
    req.logIn(user, function (err) {
      res.redirect('/profile');
    });
  })(req, res, next);
};

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

/**
 * GET /signup
 */
exports.signupGet = function (req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('signup', {
    title: 'Sign up'
  });
};

/**
 * POST /signup
 */
exports.signupPost = function (req, res, next) {

  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    req.flash('error', errors.array());
    return res.redirect('/signup');
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (user) {
      req.flash('error', { msg: 'The email address you have entered is already associated with another account.' });
      return res.redirect('/signup');
    }
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function (err) {
      req.logIn(user, function (err) {
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /logout
 */
exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

// GET /profile
exports.profile = function (req, res){
  api.userProjects(req, res).then(function(data){
    res.locals.projects = data;
    res.render('profile');
  })
}

// PUT /profile
// update profile information or password
exports.profilePut = function (req, res, next) {
  User.findById(req.user.id, function (err, user) {
    console.log(user);
    if ('password' in req.body) {
      user.password = req.body.password;
    } else {
      console.log(req.body);
      user.email = req.body.email;
      user.name = req.body.name;
      user.website = req.body.website;
    }
    user.save(function (err) {
      if ('password' in req.body) {
        req.flash('success', { msg: 'Your password has been changed.' });
      } else if (err && err.code === 11000) {
        req.flash('error', { msg: 'The email address you have entered is already associated with another account.' });
      } else {
        req.flash('success', { msg: 'Your profile information has been updated.' });
      }
      res.redirect('/profile');
    });
  });
};

/**
 * DELETE /profile
 */
exports.profileDelete = function (req, res, next) {
  User.remove({ _id: req.user.id }, function (err) {
    req.logout();
    req.flash('info', { msg: 'Your account has been permanently deleted.' });
    res.redirect('/');
  });
};

// GET /projects
exports.projects = function (req, res) {
  api.userProjects(req, res).then(function (data) {
    res.locals.projects = data;
    res.render('projects');
  })
}

// POST projects
exports.projectsPost = function(req, res){

  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    req.flash('error', errors.array());
    return res.redirect('/projects');
  }

  console.log(req.body);
  req.user.projects.push({
    project: req.body.project,
    difficulty: req.body.difficulty,
    comment: req.body.comment
  })
  req.user.save(function (err) {
    if (err) return console.log(err);
    else {
      console.log("success!!!");
      res.redirect('back');
    }
  });
}

// DELETE profile project
exports.deleteProject = function(req, res){
  User.findById(req.user.id, function (err, user) {
    user.projects.forEach(function(obj, i){
      console.log(obj);
      if(obj._id == req.params.projectId){
        user.projects[i].remove();
      }
    });
    user.save(function (err) {
      req.flash('success', { msg: 'Your project has been successfully deleted.' });
      res.redirect('/projects');
    })
  })
}



