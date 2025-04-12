// routes/index.js
const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', { title: 'Student Course Manager' });
});

module.exports = router;
