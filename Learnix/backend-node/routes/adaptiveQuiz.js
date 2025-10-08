const express = require('express');
const router = express.Router();
const adaptiveQuizService = require('../services/adaptiveQuizService');
const attemptTrackingService = require('../services/attemptTrackingService');

// Route to generate an adaptive quiz
router.post('/generate', async (req, res) => {
    try {
        const userId = req.body.userId;
        const adaptiveQuiz = await adaptiveQuizService.generateAdaptiveQuiz(userId);
        res.status(200).json(adaptiveQuiz);
    } catch (error) {
        res.status(500).json({ message: 'Error generating adaptive quiz', error });
    }
});

// Route to record a quiz attempt
router.post('/attempt', async (req, res) => {
    try {
        const attemptData = req.body;
        const recordedAttempt = await attemptTrackingService.recordAttempt(attemptData);
        res.status(201).json(recordedAttempt);
    } catch (error) {
        res.status(500).json({ message: 'Error recording quiz attempt', error });
    }
});

// Route to analyze performance
router.get('/performance/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const performanceData = await adaptiveQuizService.analyzePerformance(userId);
        res.status(200).json(performanceData);
    } catch (error) {
        res.status(500).json({ message: 'Error analyzing performance', error });
    }
});

// Route to get AI tutor conversation
router.get('/tutor/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversationData = await adaptiveQuizService.getTutorConversation(userId);
        res.status(200).json(conversationData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tutor conversation', error });
    }
});

// Route to get analytics and reports
router.get('/analytics/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const analyticsData = await adaptiveQuizService.getAnalytics(userId);
        res.status(200).json(analyticsData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving analytics', error });
    }
});

module.exports = router;