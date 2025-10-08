const admin = require('firebase-admin');

class SinglePlayerService {
  constructor() {
    try {
      this.db = admin.firestore();
      this.collection = 'singlePlayerQuizzes'; // Make sure this is correct
      console.log('✅ SinglePlayerService initialized with collection:', this.collection);
    } catch (error) {
      console.error('❌ Error initializing SinglePlayerService:', error);
      throw error;
    }
  }

  // Create a new single player quiz record
  async createSinglePlayerQuiz(quizData) {
    try {
      console.log('📝 Creating single player quiz with data:', {
        id: quizData.id,
        userId: quizData.userId,
        title: quizData.title,
        questionCount: quizData.questions?.length || 0
      });

      if (!quizData.id) {
        throw new Error('Quiz ID is required');
      }

      if (!quizData.userId) {
        throw new Error('User ID is required');
      }

      const docRef = this.db.collection(this.collection).doc(quizData.id);
      
      const singlePlayerQuiz = {
        id: quizData.id,
        title: quizData.title || 'Untitled Quiz',
        subject: quizData.subject || 'General',
        difficulty: quizData.difficulty || 'medium',
        duration: quizData.duration || 15,
        questionCount: quizData.questions ? quizData.questions.length : 0,
        
        // Player information
        userId: quizData.userId,
        playerName: quizData.playerName || 'Anonymous',
        playerAvatar: quizData.playerAvatar || 1,
        
        // Quiz content
        questions: quizData.questions || [],
        extractedData: quizData.extractedData || null,
        
        // Metadata
        gameMode: 'singleplayer',
        status: 'created', // created, in_progress, completed
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Quiz results (will be updated when completed)
        results: null,
        completedAt: null,
        score: null,
        totalQuestions: quizData.questions ? quizData.questions.length : 0,
        correctAnswers: null,
        timeSpent: null,
        
        // Additional metadata
        visibility: 'private', // Single player quizzes are always private
        originalQuizId: quizData.originalQuizId || null // For retry functionality
      };

      console.log('💾 Saving quiz to Firestore collection:', this.collection);
      await docRef.set(singlePlayerQuiz);
      
      console.log('✅ Single player quiz created successfully:', quizData.id);
      
      // Verify the document was created
      const createdDoc = await docRef.get();
      if (!createdDoc.exists) {
        throw new Error('Quiz was not saved properly');
      }
      
      console.log('🔍 Verified quiz exists in database');
      
      return {
        success: true,
        quizId: quizData.id,
        message: 'Single player quiz created successfully',
        data: singlePlayerQuiz
      };
    } catch (error) {
      console.error('❌ Error creating single player quiz:', error);
      throw new Error('Failed to create single player quiz: ' + error.message);
    }
  }

  // Update quiz progress
  async updateQuizProgress(quizId, progressData) {
    try {
      console.log('📊 Updating quiz progress for:', quizId);
      const docRef = this.db.collection(this.collection).doc(quizId);
      
      // Check if quiz exists first
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }
      
      const updateData = {
        status: progressData.status || 'in_progress',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...progressData
      };

      await docRef.update(updateData);
      console.log('✅ Quiz progress updated:', quizId);
      
      return { 
        success: true, 
        message: 'Progress updated successfully',
        quizId: quizId
      };
    } catch (error) {
      console.error('❌ Error updating quiz progress:', error);
      throw new Error('Failed to update quiz progress: ' + error.message);
    }
  }

  // Complete quiz and save results
  async completeQuiz(quizId, results) {
    try {
      console.log('🏁 Completing quiz:', quizId, 'with results:', results);
      const docRef = this.db.collection(this.collection).doc(quizId);
      
      // Check if quiz exists first
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }
      
      const completionData = {
        status: 'completed',
        results: results,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        score: results.score || 0,
        correctAnswers: results.correctAnswers || 0,
        timeSpent: results.timeSpent || 0
      };

      await docRef.update(completionData);
      console.log('✅ Single player quiz completed:', quizId);
      
      return { 
        success: true, 
        message: 'Quiz completed successfully',
        quizId: quizId,
        results: completionData
      };
    } catch (error) {
      console.error('❌ Error completing quiz:', error);
      throw new Error('Failed to complete quiz: ' + error.message);
    }
  }

  // Get single player quiz by ID
  async getQuizById(quizId) {
    try {
      console.log('🔍 Getting quiz by ID:', quizId);
      const doc = await this.db.collection(this.collection).doc(quizId).get();
      
      if (!doc.exists) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }

      const quizData = { id: doc.id, ...doc.data() };
      
      // Convert Firestore timestamps to regular dates
      if (quizData.createdAt && quizData.createdAt.toDate) {
        quizData.createdAt = quizData.createdAt.toDate();
      }
      if (quizData.completedAt && quizData.completedAt.toDate) {
        quizData.completedAt = quizData.completedAt.toDate();
      }
      if (quizData.updatedAt && quizData.updatedAt.toDate) {
        quizData.updatedAt = quizData.updatedAt.toDate();
      }

      console.log('✅ Quiz retrieved successfully');
      return {
        success: true,
        quiz: quizData
      };
    } catch (error) {
      console.error('❌ Error getting quiz:', error);
      throw new Error('Failed to get quiz: ' + error.message);
    }
  }

  // Get user's quiz history
  async getUserQuizHistory(userId, limit = 20) {
    try {
      console.log('📚 Getting quiz history for user:', userId, 'limit:', limit);
      
      const snapshot = await this.db.collection(this.collection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const quizzes = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const quiz = {
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to regular dates
          createdAt: data.createdAt?.toDate?.() || null,
          completedAt: data.completedAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null
        };
        quizzes.push(quiz);
      });

      console.log(`✅ Retrieved ${quizzes.length} quizzes for user ${userId}`);
      return {
        success: true,
        quizzes: quizzes,
        total: quizzes.length
      };
    } catch (error) {
      console.error('❌ Error getting user quiz history:', error);
      throw new Error('Failed to get quiz history: ' + error.message);
    }
  }

  // Get user's quiz statistics
  async getUserQuizStats(userId) {
    try {
      console.log('📊 Getting quiz stats for user:', userId);
      
      const snapshot = await this.db.collection(this.collection)
        .where('userId', '==', userId)
        .get();

      let totalQuizzes = 0;
      let completedQuizzes = 0;
      let totalScore = 0;
      let totalCorrectAnswers = 0;
      let totalQuestions = 0;
      let totalTimeSpent = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        totalQuizzes++;
        
        if (data.status === 'completed') {
          completedQuizzes++;
          totalScore += data.score || 0;
          totalCorrectAnswers += data.correctAnswers || 0;
          totalQuestions += data.totalQuestions || 0;
          totalTimeSpent += data.timeSpent || 0;
        }
      });

      const averageScore = completedQuizzes > 0 ? (totalScore / completedQuizzes) : 0;
      const accuracy = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;

      const stats = {
        totalQuizzes,
        completedQuizzes,
        inProgressQuizzes: totalQuizzes - completedQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        accuracy: Math.round(accuracy * 100) / 100,
        totalTimeSpent,
        totalCorrectAnswers,
        totalQuestions
      };

      console.log('✅ Quiz stats calculated:', stats);
      return {
        success: true,
        stats: stats
      };
    } catch (error) {
      console.error('❌ Error getting user quiz stats:', error);
      throw new Error('Failed to get quiz stats: ' + error.message);
    }
  }

  // Retry/restart a quiz (create new instance based on existing quiz)
  async retryQuiz(originalQuizId, userId, playerData) {
    try {
      console.log('🔄 Retrying quiz:', originalQuizId, 'for user:', userId);
      
      // Get original quiz
      const originalQuiz = await this.getQuizById(originalQuizId);
      if (!originalQuiz.success) {
        throw new Error('Original quiz not found');
      }

      // Create new quiz instance with same questions
      const { v4: uuidv4 } = require('uuid');
      const newQuizId = uuidv4();
      
      const retryQuizData = {
        id: newQuizId,
        title: `${originalQuiz.quiz.title} (Retry)`,
        subject: originalQuiz.quiz.subject,
        difficulty: originalQuiz.quiz.difficulty,
        duration: originalQuiz.quiz.duration,
        questions: originalQuiz.quiz.questions,
        extractedData: originalQuiz.quiz.extractedData,
        userId: userId,
        playerName: playerData.playerName || originalQuiz.quiz.playerName,
        playerAvatar: playerData.playerAvatar || originalQuiz.quiz.playerAvatar,
        originalQuizId: originalQuizId // Reference to original quiz
      };

      console.log('🆕 Creating retry quiz with ID:', newQuizId);
      return await this.createSinglePlayerQuiz(retryQuizData);
    } catch (error) {
      console.error('❌ Error retrying quiz:', error);
      throw new Error('Failed to retry quiz: ' + error.message);
    }
  }

  // Test collection connection
  async testConnection() {
    try {
      console.log('🔍 Testing collection connection...');
      
      // Try to get collection info
      const testDoc = this.db.collection(this.collection).doc('_test');
      await testDoc.set({ test: true, timestamp: admin.firestore.FieldValue.serverTimestamp() });
      await testDoc.delete();
      
      console.log('✅ Collection connection test successful');
      return { success: true, message: 'Connection test passed' };
    } catch (error) {
      console.error('❌ Collection connection test failed:', error);
      throw new Error('Collection connection failed: ' + error.message);
    }
  }
}

module.exports = new SinglePlayerService();