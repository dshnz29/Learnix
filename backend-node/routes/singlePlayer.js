const express = require('express');
const router = express.Router();
const singlePlayerService = require('../services/singlePlayerService');
const multer = require('multer');
const axios = require('axios');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Test collection connection
router.get('/test-collection', async (req, res) => {
  try {
    const result = await singlePlayerService.testConnection();
    res.json({
      success: true,
      message: 'Collection test successful',
      collection: 'singlePlayerQuizzes',
      result: result
    });
  } catch (error) {
    console.error('❌ Collection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      collection: 'singlePlayerQuizzes'
    });
  }
});

// List all collections (debug endpoint)
router.get('/debug/collections', async (req, res) => {
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Get all collections
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    
    res.json({
      success: true,
      collections: collectionNames,
      message: 'Available collections in Firestore'
    });
  } catch (error) {
    console.error('❌ Error listing collections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get collection stats (debug endpoint)
router.get('/debug/collection-stats', async (req, res) => {
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const snapshot = await db.collection('singlePlayerQuizzes').get();
    const docs = [];
    
    snapshot.forEach(doc => {
      docs.push({
        id: doc.id,
        userId: doc.data().userId,
        title: doc.data().title,
        status: doc.data().status,
        createdAt: doc.data().createdAt?.toDate?.() || null
      });
    });
    
    res.json({
      success: true,
      collection: 'singlePlayerQuizzes',
      totalDocuments: docs.length,
      documents: docs
    });
  } catch (error) {
    console.error('❌ Error getting collection stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate advanced quiz from PDF using Python backend
router.post('/generate-from-pdf', upload.single('pdf'), async (req, res) => {
  try {
    console.log('📁 Generating advanced MCQ quiz from PDF...');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }
    
    const { userId, subject, duration, difficulty } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Check if Python backend is running
    try {
      await axios.get('http://localhost:8000/health');
    } catch (error) {
      return res.status(503).json({
        success: false,
        error: 'Python quiz generator service is not available. Please start the Python backend on port 8000.',
        service: 'python-backend',
        port: 8000
      });
    }
    
    // Send PDF to Python backend for processing
    const FormData = require('form-data');
    const fs = require('fs');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });
    
    console.log('🐍 Sending PDF to Python backend for advanced processing...');
    
    const pythonResponse = await axios.post('http://localhost:8000/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000 // 60 seconds timeout
    });
    
    if (!pythonResponse.data.success) {
      throw new Error('Python backend failed to process PDF');
    }
    
    const quizData = pythonResponse.data.data;
    console.log('✅ Python backend generated quiz successfully');
    console.log(`📊 Generated ${quizData.questions.length} questions`);
    console.log(`🎯 Categories: ${JSON.stringify(quizData.metadata.question_categories)}`);
    
    // Enhance quiz data with user preferences
    const enhancedQuizData = {
      ...quizData,
      userId: userId,
      title: `Advanced Quiz: ${subject || quizData.metadata.subject_area || 'PDF Content'}`,
      subject: subject || quizData.metadata.subject_area || 'General',
      duration: parseInt(duration) || Math.ceil(quizData.questions.length * 1.5), // 1.5 min per question
      difficulty: difficulty || 'mixed',
      gameMode: 'singleplayer',
      source: 'pdf_advanced',
      
      // Format questions for consistency with existing system
      questions: quizData.questions.map((q, index) => ({
        id: q.id || `q_${index + 1}`,
        question: q.question,
        options: q.options || [],
        correct_answer: q.correct_answer,
        correct_index: q.correct_index || 0,
        type: q.type || 'multiple_choice',
        difficulty: q.difficulty || 'medium',
        category: q.category || 'general',
        explanation: q.explanation || 'No explanation available',
        bloom_level: q.bloom_level || 'understand',
        source_sentence: q.source_sentence || '',
        points: q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1
      })),
      
      // Enhanced metadata
      metadata: {
        ...quizData.metadata,
        enhanced_by: 'node_backend',
        user_preferences: {
          subject: subject,
          duration: duration,
          difficulty: difficulty
        },
        processing_time: new Date().toISOString(),
        question_distribution: {
          total: quizData.questions.length,
          ...quizData.metadata.question_categories
        }
      }
    };
    
    // Create quiz in database
    console.log('💾 Saving enhanced quiz to database...');
    const createResult = await singlePlayerService.createSinglePlayerQuiz(enhancedQuizData);
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup uploaded file:', cleanupError.message);
    }
    
    console.log('✅ Advanced MCQ quiz created successfully:', createResult.quizId);
    
    res.status(201).json({
      success: true,
      message: `Successfully generated advanced MCQ quiz with ${enhancedQuizData.questions.length} questions`,
      quizId: createResult.quizId,
      quiz: {
        id: createResult.quizId,
        title: enhancedQuizData.title,
        subject: enhancedQuizData.subject,
        questionCount: enhancedQuizData.questions.length,
        duration: enhancedQuizData.duration,
        difficulty: enhancedQuizData.difficulty,
        categories: enhancedQuizData.metadata.question_categories,
        bloomLevels: enhancedQuizData.metadata.bloom_taxonomy
      },
      fileInfo: quizData.file_info,
      generationStats: {
        questionTypes: enhancedQuizData.metadata.question_categories,
        difficultyDistribution: enhancedQuizData.metadata.difficulty_distribution,
        bloomTaxonomy: enhancedQuizData.metadata.bloom_taxonomy,
        subjectArea: enhancedQuizData.metadata.subject_area,
        complexityScore: enhancedQuizData.metadata.complexity_score
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating quiz from PDF:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup uploaded file after error:', cleanupError.message);
      }
    }
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Python quiz generator service is not running. Please start it on port 8000.';
      statusCode = 503;
    } else if (error.response) {
      errorMessage = error.response.data?.detail || error.response.data?.message || 'Python backend error';
      statusCode = error.response.status || 500;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create single player quiz
router.post('/create', async (req, res) => {
  try {
    const quizData = req.body;
    
    if (!quizData.userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await singlePlayerService.createSinglePlayerQuiz(quizData);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Create single player quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get quiz by ID
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const result = await singlePlayerService.getQuizById(quizId);
    res.json(result);
  } catch (error) {
    console.error('❌ Get quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update quiz progress
router.put('/quiz/:quizId/progress', async (req, res) => {
  try {
    const { quizId } = req.params;
    const progressData = req.body;
    
    const result = await singlePlayerService.updateQuizProgress(quizId, progressData);
    res.json(result);
  } catch (error) {
    console.error('❌ Update progress error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Complete quiz
router.put('/quiz/:quizId/complete', async (req, res) => {
  try {
    const { quizId } = req.params;
    const results = req.body;
    
    const result = await singlePlayerService.completeQuiz(quizId, results);
    res.json(result);
  } catch (error) {
    console.error('❌ Complete quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user quiz history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await singlePlayerService.getUserQuizHistory(userId, limit);
    res.json(result);
  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user quiz statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await singlePlayerService.getUserQuizStats(userId);
    res.json(result);
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Retry quiz
router.post('/retry/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId, playerData } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const result = await singlePlayerService.retryQuiz(quizId, userId, playerData || {});
    res.json(result);
  } catch (error) {
    console.error('❌ Retry quiz error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;