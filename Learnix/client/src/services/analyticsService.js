import { db } from '../lib/firebase'; // Import Firestore database instance

// Function to record a quiz attempt
export const recordQuizAttempt = async (userId, quizId, attemptData) => {
  try {
    const attemptRef = db.collection('quizAttempts').doc();
    await attemptRef.set({
      userId,
      quizId,
      ...attemptData,
      createdAt: new Date(),
    });
    return attemptRef.id; // Return the ID of the recorded attempt
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    throw new Error('Failed to record quiz attempt');
  }
};

// Function to fetch performance analytics for a user
export const fetchUserPerformance = async (userId) => {
  try {
    const snapshot = await db.collection('quizAttempts')
      .where('userId', '==', userId)
      .get();
    
    const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return attempts; // Return all quiz attempts for the user
  } catch (error) {
    console.error('Error fetching user performance:', error);
    throw new Error('Failed to fetch user performance');
  }
};

// Function to analyze performance data
export const analyzePerformanceData = (attempts) => {
  const totalAttempts = attempts.length;
  const successfulAttempts = attempts.filter(attempt => attempt.score >= 50).length; // Assuming 50 is the passing score
  const performancePercentage = (successfulAttempts / totalAttempts) * 100;

  return {
    totalAttempts,
    successfulAttempts,
    performancePercentage,
  };
};

// Function to generate analytics reports
export const generateAnalyticsReport = async (userId) => {
  const attempts = await fetchUserPerformance(userId);
  const analysis = analyzePerformanceData(attempts);
  
  return {
    userId,
    ...analysis,
    generatedAt: new Date(),
  };
};

// Function to interact with AI tutor
export const interactWithTutor = async (userId, message) => {
  // Placeholder for AI interaction logic
  // This could involve calling an AI service or model
  return {
    userId,
    message,
    response: "This is a response from the AI tutor.", // Placeholder response
  };
};