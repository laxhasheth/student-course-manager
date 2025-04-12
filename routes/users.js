const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Course = require('../models/Course');
const cron = require('../cronJobs'); // Import cron jobs for notifications

// Register page
router.get('/register', (req, res) => {
  res.render('users/register');
});

// Register form submission
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || !email || !password) {
    errors.push({ msg: 'Please fill all fields' });
  }

  if (errors.length > 0) {
    return res.render('users/register', { errors });
  }

  try {
    const user = new User({ username, email, password });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    res.redirect('/users/register');
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('users/login');
});

// Login form submission
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}));

// GitHub login
router.get('/github', passport.authenticate('github'));

// GitHub callback route
router.get('/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}));

// Profile page (protected)
router.get('/profile', (req, res) => {
  if (!req.user) {
    return res.redirect('/users/login');
  }
  res.render('users/profile', { user: req.user });
});

// Fetch user notifications (example of integrating notifications)
router.get('/notifications', async (req, res) => {
  if (!req.user) {
    return res.redirect('/users/login');
  }

  // Fetch courses with upcoming deadlines
  const userCourses = await Course.find({ user: req.user._id });
  const notifications = [];

  userCourses.forEach(course => {
    if (course.endDate && new Date(course.endDate) < new Date()) {
      notifications.push(`Deadline for course ${course.title} has passed.`);
    }
  });

  res.render('users/notifications', { notifications });
});

module.exports = router;
