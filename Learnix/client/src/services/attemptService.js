import { db } from '../lib/firebase'; // Import Firestore database instance
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Function to record a quiz attempt
export const recordQuizAttempt = async (userId, quizId, score, totalQuestions, timestamp) => {
  try {
    const attemptData = {
      userId,
      quizId,
      score,
      totalQuestions,
      timestamp,
    };
    const docRef = await addDoc(collection(db, 'quizAttempts'), attemptData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error recording quiz attempt: ", error);
    return { success: false, error: error.message };
  }
};

// Function to retrieve quiz attempts for a specific user
export const getQuizAttemptsByUser = async (userId) => {
  try {
    const attemptsQuery = query(collection(db, 'quizAttempts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(attemptsQuery);
    const attempts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, attempts };
  } catch (error) {
    console.error("Error retrieving quiz attempts: ", error);
    return { success: false, error: error.message };
  }
};

// Function to analyze performance based on quiz attempts
export const analyzePerformance = (attempts) => {
  if (!attempts || attempts.length === 0) return null;

  const totalAttempts = attempts.length;
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = totalScore / totalAttempts;

  return {
    totalAttempts,
    averageScore,
  };
};