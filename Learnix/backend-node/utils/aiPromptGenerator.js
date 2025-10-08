const admin = require('firebase-admin');
const db = admin.firestore();

const generateAIPrompt = (userPerformance, quizData) => {
    // Analyze user performance and quiz data to generate a tailored prompt
    const { accuracy, timeSpent, attempts } = userPerformance;
    const { difficultyLevel, topic } = quizData;

    let prompt = `Based on your recent performance, you have an accuracy of ${accuracy}% with an average time of ${timeSpent} seconds per attempt. `;
    
    if (accuracy < 70) {
        prompt += `It seems you are struggling with ${topic}. Let's focus on improving your understanding of this topic. `;
    } else {
        prompt += `Great job on your attempts! Let's challenge you with some advanced questions on ${topic}. `;
    }

    prompt += `You have attempted this quiz ${attempts} times. Would you like to review the questions you found difficult?`;

    return prompt;
};

const recordQuizAttempt = async (userId, quizId, performanceData) => {
    const attemptRef = db.collection('quizAttempts').doc();
    await attemptRef.set({
        userId,
        quizId,
        ...performanceData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return attemptRef.id;
};

const analyzePerformance = async (userId) => {
    const attemptsSnapshot = await db.collection('quizAttempts').where('userId', '==', userId).get();
    let totalAccuracy = 0;
    let totalAttempts = attemptsSnapshot.size;

    attemptsSnapshot.forEach(doc => {
        const data = doc.data();
        totalAccuracy += data.accuracy;
    });

    return {
        accuracy: totalAttempts ? (totalAccuracy / totalAttempts) : 0,
        attempts: totalAttempts,
    };
};

const generateAdaptiveQuiz = async (userId) => {
    const performanceData = await analyzePerformance(userId);
    const quizData = await db.collection('quizzes').orderBy('difficultyLevel').limit(1).get();

    if (!quizData.empty) {
        const quiz = quizData.docs[0].data();
        const prompt = generateAIPrompt(performanceData, quiz);
        return { prompt, quiz };
    }

    return null;
};

module.exports = {
    generateAIPrompt,
    recordQuizAttempt,
    analyzePerformance,
    generateAdaptiveQuiz,
};