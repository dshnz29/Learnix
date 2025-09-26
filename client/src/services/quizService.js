import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export class QuizService {
  
  // Helper function to clean data and remove undefined values
  static cleanDataForFirestore(data) {
    const cleanObject = (obj) => {
      if (obj === null || obj === undefined) {
        return null;
      }
      
      if (typeof obj !== 'object' || obj instanceof Date) {
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(cleanObject).filter(item => item !== undefined);
      }
      
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = cleanObject(value);
        }
      }
      return cleaned;
    };
    
    return cleanObject(data);
  }
  
  // Store quiz data in Firestore
  static async createQuiz(quizData) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      console.log('📝 Storing quiz in Firebase:', quizData.title);
      
      // Clean and structure the quiz document
      const quizDoc = {
        title: quizData.title || 'Untitled Quiz',
        subject: quizData.subject || 'General',
        difficulty: quizData.difficulty || 'medium',
        visibility: quizData.visibility || 'Public',
        duration: quizData.duration || 15,
        questionCount: quizData.questions?.length || 0,
        hostName: quizData.hostName || 'Anonymous',
        hostAvatar: quizData.hostAvatar || 1,
        
        // Store questions and answers
        questions: quizData.questions || [],
        
        // Clean extracted data to remove undefined values
        extractedData: quizData.extractedData ? {
          filename: quizData.extractedData.filename || null,
          fileSize: quizData.extractedData.fileSize || null,
          id: quizData.extractedData.id || null,
          textLength: quizData.extractedData.textLength || null,
          cleanedLength: quizData.extractedData.cleanedLength || null,
          pages: quizData.extractedData.pages || null,
          processingTime: quizData.extractedData.processingTime || null,
          fallbackUsed: quizData.extractedData.fallbackUsed || false
        } : null,
        
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'draft', // draft, active, completed
        participants: 0,
        totalAttempts: 0,
        
        // Analytics
        stats: {
          avgScore: 0,
          completionRate: 0,
          mostMissedQuestions: []
        }
      };

      // Clean the entire document to remove any undefined values
      const cleanedQuizDoc = this.cleanDataForFirestore(quizDoc);

      console.log('🧹 Cleaned quiz document:', cleanedQuizDoc);

      const docRef = await addDoc(collection(db, 'quizzes'), cleanedQuizDoc);
      console.log('✅ Quiz stored with ID:', docRef.id);
      
      return { id: docRef.id, ...cleanedQuizDoc };
    } catch (error) {
      console.error('❌ Error storing quiz:', error);
      throw new Error(`Failed to store quiz: ${error.message}`);
    }
  }

  // Get quiz by ID
  static async getQuiz(quizId) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      const docRef = doc(db, 'quizzes', quizId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Quiz not found');
      }
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      throw error;
    }
  }

  // Update quiz status (draft -> active -> completed)
  static async updateQuizStatus(quizId, status, updateData = {}) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      // Clean update data
      const cleanedUpdateData = this.cleanDataForFirestore({
        status,
        updatedAt: serverTimestamp(),
        ...updateData
      });

      const docRef = doc(db, 'quizzes', quizId);
      await updateDoc(docRef, cleanedUpdateData);
      
      console.log(`✅ Quiz ${quizId} status updated to: ${status}`);
    } catch (error) {
      console.error('❌ Error updating quiz status:', error);
      throw error;
    }
  }

  // Store quiz results/attempts
  static async storeQuizAttempt(quizId, attemptData) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      const attemptDoc = {
        quizId: quizId || null,
        participantName: attemptData.participantName || 'Anonymous',
        participantId: attemptData.participantId || null,
        answers: attemptData.answers || {},
        score: attemptData.score || 0,
        percentage: attemptData.percentage || 0,
        timeSpent: attemptData.timeSpent || 0,
        completedAt: serverTimestamp(),
        
        // Detailed analytics
        questionResults: attemptData.questionResults || [],
        startedAt: attemptData.startedAt || null,
        submittedAt: attemptData.submittedAt || null
      };

      // Clean the attempt document
      const cleanedAttemptDoc = this.cleanDataForFirestore(attemptDoc);

      const docRef = await addDoc(collection(db, 'quizAttempts'), cleanedAttemptDoc);
      
      // Update quiz stats
      await this.updateQuizStats(quizId, attemptData);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error storing quiz attempt:', error);
      throw error;
    }
  }

  // Update quiz statistics
  static async updateQuizStats(quizId, attemptData) {
    try {
      if (!db) {
        return; // Skip if Firebase not available
      }

      const quizRef = doc(db, 'quizzes', quizId);
      const quizDoc = await getDoc(quizRef);
      
      if (quizDoc.exists()) {
        const currentStats = quizDoc.data().stats || {};
        const totalAttempts = (quizDoc.data().totalAttempts || 0) + 1;
        
        // Calculate new average score
        const currentAvg = currentStats.avgScore || 0;
        const newAvg = ((currentAvg * (totalAttempts - 1)) + (attemptData.percentage || 0)) / totalAttempts;
        
        const updateData = {
          totalAttempts,
          'stats.avgScore': Math.round(newAvg * 100) / 100,
          'stats.completionRate': Math.round((totalAttempts / Math.max(quizDoc.data().participants || 1, 1)) * 100),
          updatedAt: serverTimestamp()
        };

        await updateDoc(quizRef, updateData);
      }
    } catch (error) {
      console.error('❌ Error updating quiz stats:', error);
    }
  }

  // Get user's quizzes
  static async getUserQuizzes(userId, limitCount = 20) {
    try {
      if (!db) {
        return [];
      }

      const q = query(
        collection(db, 'quizzes'),
        where('hostId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const quizzes = [];
      
      querySnapshot.forEach((doc) => {
        quizzes.push({ id: doc.id, ...doc.data() });
      });
      
      return quizzes;
    } catch (error) {
      console.error('❌ Error fetching user quizzes:', error);
      throw error;
    }
  }

  // Get public quizzes
  static async getPublicQuizzes(limitCount = 50) {
    try {
      if (!db) {
        return [];
      }

      const q = query(
        collection(db, 'quizzes'),
        where('visibility', '==', 'Public'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const quizzes = [];
      
      querySnapshot.forEach((doc) => {
        quizzes.push({ id: doc.id, ...doc.data() });
      });
      
      return quizzes;
    } catch (error) {
      console.error('❌ Error fetching public quizzes:', error);
      throw error;
    }
  }

  // Delete quiz
  static async deleteQuiz(quizId) {
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      await deleteDoc(doc(db, 'quizzes', quizId));
      
      // Also delete related attempts
      const attemptsQuery = query(
        collection(db, 'quizAttempts'),
        where('quizId', '==', quizId)
      );
      
      const attemptsSnapshot = await getDocs(attemptsQuery);
      const deletePromises = attemptsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('✅ Quiz and related data deleted');
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      throw error;
    }
  }
}

export default QuizService;