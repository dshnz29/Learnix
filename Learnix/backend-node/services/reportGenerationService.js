const admin = require('firebase-admin');
const db = admin.firestore();

// Function to record quiz attempts
const recordQuizAttempt = async (userId, quizId, answers, score) => {
    const attemptData = {
        userId,
        quizId,
        answers,
        score,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const attemptRef = await db.collection('quizAttempts').add(attemptData);
        return attemptRef.id;
    } catch (error) {
        throw new Error('Error recording quiz attempt: ' + error.message);
    }
};

// Function to analyze user performance
const analyzePerformance = async (userId) => {
    try {
        const attemptsSnapshot = await db.collection('quizAttempts')
            .where('userId', '==', userId)
            .get();

        const performanceData = {
            totalAttempts: attemptsSnapshot.size,
            totalScore: 0,
            averageScore: 0,
        };

        attemptsSnapshot.forEach(doc => {
            performanceData.totalScore += doc.data().score;
        });

        if (performanceData.totalAttempts > 0) {
            performanceData.averageScore = performanceData.totalScore / performanceData.totalAttempts;
        }

        return performanceData;
    } catch (error) {
        throw new Error('Error analyzing performance: ' + error.message);
    }
};

// Function to generate reports
const generateReport = async (userId) => {
    try {
        const performanceData = await analyzePerformance(userId);
        const reportData = {
            userId,
            performanceData,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const reportRef = await db.collection('reports').add(reportData);
        return reportRef.id;
    } catch (error) {
        throw new Error('Error generating report: ' + error.message);
    }
};

// Function to handle AI tutor conversation
const handleTutorConversation = async (userId, message) => {
    const conversationData = {
        userId,
        message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const conversationRef = await db.collection('tutorConversations').add(conversationData);
        return conversationRef.id;
    } catch (error) {
        throw new Error('Error handling tutor conversation: ' + error.message);
    }
};

// Function to generate adaptive quizzes based on performance
const generateAdaptiveQuiz = async (userId) => {
    const performanceData = await analyzePerformance(userId);
    // Logic to generate adaptive quiz based on performanceData
    // This is a placeholder for the actual quiz generation logic
    const adaptiveQuiz = {
        userId,
        questions: [], // Populate with questions based on performance
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const quizRef = await db.collection('adaptiveQuizzes').add(adaptiveQuiz);
        return quizRef.id;
    } catch (error) {
        throw new Error('Error generating adaptive quiz: ' + error.message);
    }
};

module.exports = {
    recordQuizAttempt,
    analyzePerformance,
    generateReport,
    handleTutorConversation,
    generateAdaptiveQuiz,
};