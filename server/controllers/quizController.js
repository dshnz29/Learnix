const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const geminiService = require('../services/geminiService');
const Quiz = require('../models/Quiz');

exports.uploadAndGenerateQuestions = async (req, res) => {
  try {
    const file = req.file;
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdf(dataBuffer);

    const text = pdfData.text.slice(0, 3000); // Gemini input limit
    console.log('Extracted text:', text);
    const questions = await geminiService.generateQuizQuestions(text);
    const quizId = await Quiz.saveQuiz(file.originalname, JSON.stringify(questions));

    fs.unlinkSync(file.path); // Clean up

    res.json({ quizId, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.getQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    res.json({ quizId: quiz.id, questions: JSON.parse(quiz.questions) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve quiz' });
  }
};
