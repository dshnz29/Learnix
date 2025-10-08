const express = require('express');
const router = express.Router();
const aiTutorService = require('../services/aiTutorService');
const attemptTrackingService = require('../services/attemptTrackingService');

// Route to initiate a conversation with the AI tutor
router.post('/conversation', async (req, res) => {
    try {
        const { userId, message } = req.body;
        const response = await aiTutorService.initiateConversation(userId, message);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error initiating conversation with AI tutor' });
    }
});

// Route to get conversation history
router.get('/conversation/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await aiTutorService.getConversationHistory(userId);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving conversation history' });
    }
});

// Route to record quiz attempt
router.post('/attempt', async (req, res) => {
    try {
        const attemptData = req.body;
        const result = await attemptTrackingService.recordAttempt(attemptData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error recording quiz attempt' });
    }
});

// Route to analyze performance
router.get('/performance/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const performanceData = await attemptTrackingService.analyzePerformance(userId);
        res.status(200).json(performanceData);
    } catch (error) {
        res.status(500).json({ error: 'Error analyzing performance' });
    }
});

module.exports = router;