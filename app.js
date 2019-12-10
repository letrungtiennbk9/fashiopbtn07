let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let userRoutes = require('./routes/users');
let indexRouter = require('./routes/index');
let categoryRouter = require('./routes/category');
let searchResultRouter = require('./routes/search-result');
let singleProductRouter = require('./routes/single-product');
let cartRouter = require('./routes/cart');
let checkoutRouter = require('./routes/checkout');
let confirmationRouter = require('./routes/confirmation');
let trackingRouter = require('./routes/tracking');
let mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error',console.error.bind(console, 'MongoDB connection error.....'));


const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

let app = express();

//passport config
require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', userRoutes);
app.use('/index', indexRouter);
app.use('/category', categoryRouter);
app.use('/search-result', searchResultRouter);
app.use('/single-product',singleProductRouter);
app.use('/checkout',checkoutRouter);
app.use('/cart',cartRouter);
app.use('/confirmation',confirmationRouter);
app.use('/tracking',trackingRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

