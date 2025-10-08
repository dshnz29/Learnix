const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const analyticsRoutes = require('./routes/analytics');
const attemptsRoutes = require('./routes/attempts');
const tutorRoutes = require('./routes/tutor');
const adaptiveQuizRoutes = require('./routes/adaptiveQuiz');
const reportsRoutes = require('./routes/reports');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/adaptiveQuiz', adaptiveQuizRoutes);
app.use('/api/reports', reportsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});