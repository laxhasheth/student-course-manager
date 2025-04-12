const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// List all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('user', 'username email'); // populate user details
    res.render('courses/list', { courses });
  } catch (err) {
    console.error(err);
    res.redirect('/courses');
  }
});

// Add new course page (private)
router.get('/add', (req, res) => {
  if (!req.user) {
    return res.redirect('/users/login');
  }
  res.render('courses/add');
});

// Add new course (POST)
router.post('/add', async (req, res) => {
  const { title, code, description, startDate, endDate } = req.body;
  
  // Make sure the user is logged in
  if (!req.user) {
    return res.redirect('/users/login');
  }

  try {
    // Create a new course document and link it to the logged-in user
    const newCourse = new Course({
      title,
      code,
      description,
      startDate,
      endDate,
      user: req.user.id, // Store the logged-in user's ID
    });

    await newCourse.save();
    res.redirect('/courses');
  } catch (err) {
    console.error(err);
    res.redirect('/courses/add');
  }
});

// Edit course page (private)
router.get('/edit/:id', async (req, res) => {
  if (!req.user) {
    return res.redirect('/users/login');
  }
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.user.toString() !== req.user.id) {
      return res.redirect('/courses'); // Only allow the course creator to edit
    }
    res.render('courses/edit', { course });
  } catch (err) {
    console.error(err);
    res.redirect('/courses');
  }
});

// Update course (POST)
router.post('/edit/:id', async (req, res) => {
  const { title, code, description, startDate, endDate } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.user.toString() !== req.user.id) {
      return res.redirect('/courses'); // Only allow the course creator to update
    }

    await Course.findByIdAndUpdate(req.params.id, {
      title,
      code,
      description,
      startDate,
      endDate,
    });

    res.redirect('/courses');
  } catch (err) {
    console.error(err);
    res.redirect(`/courses/edit/${req.params.id}`);
  }
});

// Delete course
router.get('/delete/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.user.toString() !== req.user.id) {
      return res.redirect('/courses'); // Only allow the course creator to delete
    }

    await Course.findByIdAndDelete(req.params.id);
    res.redirect('/courses');
  } catch (err) {
    console.error(err);
    res.redirect('/courses');
  }
});

module.exports = router;
