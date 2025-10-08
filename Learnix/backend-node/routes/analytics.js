const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// Route to get user performance analytics
router.get('/performance/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const performanceData = await analyticsService.getUserPerformance(userId);
        res.status(200).json(performanceData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving performance data', error });
    }
});

// Route to get quiz attempt analytics
router.get('/attempts/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const attemptsData = await analyticsService.getQuizAttempts(userId);
        res.status(200).json(attemptsData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving quiz attempts', error });
    }
});

// Route to get overall learning analytics
router.get('/learning/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const learningAnalytics = await analyticsService.getLearningAnalytics(userId);
        res.status(200).json(learningAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving learning analytics', error });
    }
});

module.exports = router;