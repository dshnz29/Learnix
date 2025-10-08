const admin = require('firebase-admin');
const QuizAttempt = require('../models/QuizAttempt');
const UserProgress = require('../models/UserProgress');

// Initialize Firestore
const db = admin.firestore();

// Record a quiz attempt
const recordQuizAttempt = async (userId, quizId, answers, score) => {
    try {
        const attemptData = {
            userId,
            quizId,
            answers,
            score,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };

        const attemptRef = await db.collection('quizAttempts').add(attemptData);
        return attemptRef.id;
    } catch (error) {
        throw new Error('Error recording quiz attempt: ' + error.message);
    }
};

// Get quiz attempt by ID
const getQuizAttemptById = async (attemptId) => {
    try {
        const attemptRef = db.collection('quizAttempts').doc(attemptId);
        const attemptDoc = await attemptRef.get();

        if (!attemptDoc.exists) {
            throw new Error('Quiz attempt not found');
        }

        return { id: attemptDoc.id, ...attemptDoc.data() };
    } catch (error) {
        throw new Error('Error fetching quiz attempt: ' + error.message);
    }
};

// Analyze performance based on quiz attempts
const analyzePerformance = async (userId) => {
    try {
        const attemptsSnapshot = await db.collection('quizAttempts').where('userId', '==', userId).get();
        const attempts = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Perform analysis (e.g., calculate average score)
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = totalScore / attempts.length;

        return {
            totalAttempts: attempts.length,
            averageScore,
        };
    } catch (error) {
        throw new Error('Error analyzing performance: ' + error.message);
    }
};

// Export the service functions
module.exports = {
    recordQuizAttempt,
    getQuizAttemptById,
    analyzePerformance,
};