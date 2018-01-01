var express = require('express');
var path = require('path');
var url = require("url");
// var favicon = require('serve-favicon');
var logger = require('morgan');
var dotenv = require('dotenv');
var compression = require('compression')
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var mongoose = require('mongoose');
var passport = require('passport');
var { check, validationResult } = require('express-validator/check');
var { matchedData, sanitize } = require('express-validator/filter');

// Load environment variables from .env file
dotenv.load();

var index = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');

require('./config/passport');

var app = express();

Promise.all([
  app.use(compression()),
  app.use(logger('dev')),
  app.use(bodyParser.json({ limit: '50mb' })),
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })),
  app.use(methodOverride('_method')),
  app.use(cookieParser()),
  app.use(express.static(path.join(__dirname, 'public'))),
  app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true })),
  app.use(flash()),
  app.use(passport.initialize()),
  app.use(passport.session())
]).then(() => {
  console.log("yay theyre all done");
})

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function () {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('json spaces', 2);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// set variables useable in .pug files
app.use(function (req, res, next) {
  res.locals.user = req.user;
  res.locals.path = req.path;
  res.locals.url = req.originalUrl;
  next();
});

app.get('/', index.index);
app.post('/', [
  check('email', 'Email is not valid').isEmail(),
  check('email', 'Email cannot be blank').isLength({ min: 1 }),
  check('password', 'Password cannot be blank').isLength({ min: 1 }),
  sanitize('email').normalizeEmail()
], users.loginPost)

app.get('/signup', users.signupGet)
app.post('/signup', [
  check('name', 'Name cannot be blank').isLength({ min: 1 }),
  check('email', 'Email is not valid').isEmail(),
  check('email', 'Email cannot be blank').isLength({ min: 1 }),
  check('password', 'Password must be at least 4 characters long').isLength(4),
  sanitize('email').normalizeEmail()
], users.signupPost)

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email profile repo'] }));
app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/' }));
app.get('/unlink/github', users.ensureAuthenticated, users.unlink);

app.get('/logout', users.logout);

app.get('/api', api.api);

app.get('/profile', users.ensureAuthenticated, users.profile);
app.put('/profile', users.ensureAuthenticated, users.profilePut);
app.delete('/profile', users.ensureAuthenticated, users.profileDelete);

app.post('/fork-repo', users.checkAuth);
app.get('/fork-repo/:forkUrl', users.forkProject);

app.get('/projects', users.ensureAuthenticated, users.projects);
app.post('/projects', users.ensureAuthenticated, [
  check('project', 'Github URL must be entered correctly')
    .custom(value => {
      return api.checkRepoExists(value)
        .then(blah => {
          console.log(blah + " this is in the validator");
          return blah == "Repo Exists" ? true : false
        })
    }),
  check('comment', 'Comment cannot be blank').isLength({ min: 1 })
], users.projectsPost);

app.get('/delete/:projectId', users.ensureAuthenticated, users.deleteProject);

app.post('/checkRepoExists', users.ensureAuthenticated, api.checkRepoExists);

app.post('/fetchReadme', api.fetchReadme);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
