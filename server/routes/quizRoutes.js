const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const quizController = require('../controllers/quizController');

router.post('/upload', upload.single('pdf'), quizController.uploadAndGenerateQuestions);
router.get('/:id', quizController.getQuizById);

module.exports = router;
