const express = require('express');
const router = express.Router();
const attemptTrackingService = require('../services/attemptTrackingService');

// Record a new quiz attempt
router.post('/', async (req, res) => {
    try {
        const attemptData = req.body;
        const newAttempt = await attemptTrackingService.recordAttempt(attemptData);
        res.status(201).json(newAttempt);
    } catch (error) {
        res.status(500).json({ message: 'Error recording attempt', error: error.message });
    }
});

// Retrieve attempts for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const attempts = await attemptTrackingService.getAttemptsByUserId(userId);
        res.status(200).json(attempts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving attempts', error: error.message });
    }
});

// Retrieve a specific attempt by attempt ID
router.get('/attempt/:attemptId', async (req, res) => {
    try {
        const attemptId = req.params.attemptId;
        const attempt = await attemptTrackingService.getAttemptById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }
        res.status(200).json(attempt);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving attempt', error: error.message });
    }
});

module.exports = router;