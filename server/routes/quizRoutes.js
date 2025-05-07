const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// POST /api/quiz/upload - Upload PDF and generate quiz
router.post('/upload', quizController.uploadQuiz);

module.exports = router;