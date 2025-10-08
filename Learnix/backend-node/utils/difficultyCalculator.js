const admin = require('firebase-admin');
const db = admin.firestore();

// Function to calculate difficulty based on user performance
const calculateDifficulty = async (userId) => {
    const userProgressRef = db.collection('userProgress').doc(userId);
    const userProgress = await userProgressRef.get();

    if (!userProgress.exists) {
        throw new Error('User progress not found');
    }

    const data = userProgress.data();
    const correctAnswers = data.correctAnswers || 0;
    const totalQuestions = data.totalQuestions || 1; // Avoid division by zero

    const successRate = correctAnswers / totalQuestions;

    // Adjust difficulty based on success rate
    if (successRate > 0.8) {
        return 'hard';
    } else if (successRate > 0.5) {
        return 'medium';
    } else {
        return 'easy';
    }
};

// Function to record quiz attempt
const recordQuizAttempt = async (userId, quizId, score) => {
    const quizAttemptRef = db.collection('quizAttempts').doc();
    await quizAttemptRef.set({
        userId,
        quizId,
        score,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
};

// Function to analyze performance
const analyzePerformance = async (userId) => {
    const attemptsRef = db.collection('quizAttempts').where('userId', '==', userId);
    const attemptsSnapshot = await attemptsRef.get();

    let totalScore = 0;
    let attemptCount = 0;

    attemptsSnapshot.forEach(doc => {
        totalScore += doc.data().score;
        attemptCount++;
    });

    return {
        averageScore: attemptCount > 0 ? totalScore / attemptCount : 0,
        attemptCount,
    };
};

module.exports = {
    calculateDifficulty,
    recordQuizAttempt,
    analyzePerformance,
};