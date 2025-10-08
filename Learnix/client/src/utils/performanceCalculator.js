import { db } from '../lib/firebase'; // Import Firestore database instance

// Function to record quiz attempt
export const recordQuizAttempt = async (userId, quizId, score, duration) => {
  try {
    const attemptData = {
      userId,
      quizId,
      score,
      duration,
      timestamp: new Date(),
    };
    await db.collection('quizAttempts').add(attemptData);
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
  }
};

// Function to analyze performance
export const analyzePerformance = async (userId) => {
  try {
    const attemptsSnapshot = await db.collection('quizAttempts').where('userId', '==', userId).get();
    const attempts = attemptsSnapshot.docs.map(doc => doc.data());

    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((acc, attempt) => acc + attempt.score, 0);
    const averageScore = totalAttempts ? totalScore / totalAttempts : 0;

    return {
      totalAttempts,
      averageScore,
    };
  } catch (error) {
    console.error('Error analyzing performance:', error);
    return null;
  }
};

// Function to generate adaptive quiz based on performance
export const generateAdaptiveQuiz = async (userId) => {
  const performanceData = await analyzePerformance(userId);
  if (!performanceData) return null;

  // Logic to adjust quiz difficulty based on performance
  const { averageScore } = performanceData;
  const difficultyLevel = averageScore > 80 ? 'hard' : averageScore > 50 ? 'medium' : 'easy';

  // Fetch quiz questions based on difficulty level
  const quizQuestionsSnapshot = await db.collection('quizzes').where('difficulty', '==', difficultyLevel).get();
  const quizQuestions = quizQuestionsSnapshot.docs.map(doc => doc.data());

  return quizQuestions;
};

// Function to initiate AI tutor conversation
export const initiateTutorConversation = async (userId, topic) => {
  try {
    const conversationData = {
      userId,
      topic,
      messages: [],
      timestamp: new Date(),
    };
    const conversationRef = await db.collection('tutorConversations').add(conversationData);
    return conversationRef.id; // Return conversation ID for further interactions
  } catch (error) {
    console.error('Error initiating tutor conversation:', error);
    return null;
  }
};

// Function to log analytics data
export const logAnalyticsData = async (userId, data) => {
  try {
    const analyticsData = {
      userId,
      data,
      timestamp: new Date(),
    };
    await db.collection('analytics').add(analyticsData);
  } catch (error) {
    console.error('Error logging analytics data:', error);
  }
};