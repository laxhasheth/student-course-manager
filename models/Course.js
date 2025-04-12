const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  startDate: Date,
  endDate: Date,
  progress: {
    type: Number,
    default: 0,  // Represents the percentage of course completion (0-100)
    min: 0,
    max: 100
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

module.exports = mongoose.model('Course', courseSchema);
