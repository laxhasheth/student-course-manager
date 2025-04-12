const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();

// Passport Config
require('./config/passport')(passport);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Import cron jobs
require('./cronJobs');  // Load scheduled jobs

// View Engine Setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const hbs = require('hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions and Passport
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// 🔑 Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const courseRouter = require('./routes/courses');

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/courses', courseRouter);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
