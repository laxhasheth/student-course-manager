const cron = require('node-cron');
const Course = require('./models/Course');

// Check for upcoming deadlines every day at midnight (adjust cron schedule as needed)
cron.schedule('0 0 * * *', async () => {
  const today = new Date();
  const upcomingCourses = await Course.find({
    endDate: { $gte: today },
  });

  upcomingCourses.forEach(course => {
    // Check if the course's deadline is within the next 7 days
    const daysLeft = Math.ceil((course.endDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) {
      console.log(`Course Deadline Approaching: ${course.title} - ${daysLeft} days left.`);
      // Here you could send an email or other notification to the user.
    }
  });
});
