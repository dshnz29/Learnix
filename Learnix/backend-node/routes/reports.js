const express = require('express');
const router = express.Router();
const reportGenerationService = require('../services/reportGenerationService');

// Route to generate a report based on user performance
router.post('/generate', async (req, res) => {
    try {
        const { userId, reportType } = req.body;
        const report = await reportGenerationService.generateReport(userId, reportType);
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
});

// Route to retrieve a specific report
router.get('/:reportId', async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await reportGenerationService.getReport(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving report', error: error.message });
    }
});

// Route to retrieve all reports for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const reports = await reportGenerationService.getReportsByUser(userId);
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reports', error: error.message });
    }
});

module.exports = router;