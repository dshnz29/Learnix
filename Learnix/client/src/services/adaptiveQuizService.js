import { db } from '../lib/firebase'; // Import Firestore database
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Function to record a quiz attempt
export const recordQuizAttempt = async (userId, quizId, answers, score) => {
  try {
    const docRef = await addDoc(collection(db, 'quizAttempts'), {
      userId,
      quizId,
      answers,
      score,
      timestamp: new Date(),
    });
    return docRef.id; // Return the ID of the recorded attempt
  } catch (error) {
    console.error("Error recording quiz attempt: ", error);
    throw new Error('Failed to record quiz attempt');
  }
};

// Function to retrieve quiz attempts for a user
export const getQuizAttempts = async (userId) => {
  try {
    const attemptsQuery = query(collection(db, 'quizAttempts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(attemptsQuery);
    const attempts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return attempts; // Return the list of attempts
  } catch (error) {
    console.error("Error retrieving quiz attempts: ", error);
    throw new Error('Failed to retrieve quiz attempts');
  }
};

// Function to analyze performance based on quiz attempts
export const analyzePerformance = (attempts) => {
  const totalAttempts = attempts.length;
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = totalAttempts ? totalScore / totalAttempts : 0;

  return {
    totalAttempts,
    averageScore,
  };
};

// Function to generate adaptive quizzes based on user performance
export const generateAdaptiveQuiz = (userPerformanceData) => {
  // Logic to generate quizzes based on user performance
  // This could involve analyzing strengths and weaknesses and adjusting difficulty
  // For now, returning a placeholder
  return {
    quizId: 'adaptive-quiz-1',
    questions: [], // Populate with generated questions
  };
};