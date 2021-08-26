var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Import the model instances of sequelize
const models = require("./models");
const { sequelize } = require('./models');

// Use an Immediately Invoked Function Expression (IIFE function) 
(async() => {
  // Sync the model with the database
  await models.sequelize.sync();
  try {
    // Attempt to connect to the database
    await sequelize.authenticate();
    console.log("Connected to the database successfully!")
  }
  catch {
    console.log("There seems to be a connection error...")
  }
})()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/static", express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = "Page not found."
  next(err);
})

// Global error handler
app.use((err, req, res, next) => {
  if (err.status === 404) {
    console.log(`${err.message} (${err.status})`);
    // Render the "page-not-found" template
    res.render("page-not-found", {err});
}
  else {
    // Assign error message if not available
    err.message = err.message || "Server-side problem identified. Please contact the administrator."
    // Set error status 500 if not defined and render the "Error" page
    console.log('Oops an error has occurred:', `${err.message} (${err.status})`);
    res.status(err.status || 500).render("error", {err})
  }
});

module.exports = app;
