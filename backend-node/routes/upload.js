const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin (add your service account key)
if (!admin.apps.length) {
  const serviceAccount = require('../config/serviceAccountKey.json'); // Add your service account key
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Enhanced multer config with better error handling
const upload = multer({ 
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(`📎 Received file: ${file.originalname}, type: ${file.mimetype}`);
    
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      console.log(`❌ Rejected file type: ${file.mimetype}`);
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const uploadWithErrorHandling = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log(`❌ Multer error: ${err.message}`);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          success: false, 
          error: "File size too large (max 10MB)" 
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    } else if (err) {
      console.log(`❌ Upload error: ${err.message}`);
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
};

// Main upload endpoint
router.post("/upload", uploadWithErrorHandling, async (req, res) => {
  const startTime = Date.now();
  
  console.log("\n=== 📄 PDF UPLOAD REQUEST ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("File:", req.file ? req.file.originalname : "❌ No file");
  console.log("File size:", req.file ? `${req.file.size} bytes` : "N/A");
  console.log("Body params:", req.body);

  try {
    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({ 
        success: false, 
        error: "No file uploaded" 
      });
    }

    // Validate file exists and is readable
    if (!fs.existsSync(req.file.path)) {
      console.log(`❌ Uploaded file not found at: ${req.file.path}`);
      return res.status(500).json({ 
        success: false, 
        error: "File upload failed" 
      });
    }

    console.log(`📤 Processing: ${req.file.originalname} (${req.file.size} bytes)`);

    // Create FormData with proper content type
    const formData = new FormData();
    
    // Add file with explicit options
    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: 'application/pdf',
      knownLength: req.file.size
    });

    // Add quiz parameters
    const quizParams = {
      question_count: parseInt(req.body.questionCount) || 10,
      difficulty: req.body.difficulty || 'medium',
      subject: req.body.subject || 'general'
    };

    formData.append("params", JSON.stringify(quizParams));

    console.log("🎯 Quiz params:", quizParams);
    console.log("📤 Forwarding to Python backend...");

    // Enhanced axios call with better configuration
    const pythonResponse = await axios({
      method: 'post',
      url: "http://localhost:8000/extract",
      data: formData,
      headers: {
        ...formData.getHeaders(),
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
      },
      timeout: 90000, // 90 second timeout for AI processing
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: (status) => status < 500 // Don't reject on 4xx errors
    });

    console.log(`📥 Python response status: ${pythonResponse.status}`);

    // Cleanup temp file
    try {
      fs.unlinkSync(req.file.path);
      console.log("🧹 Temp file cleaned up");
    } catch (cleanupErr) {
      console.log("⚠️  Could not cleanup temp file:", cleanupErr.message);
    }

    // Handle Python backend responses
    if (pythonResponse.status === 200) {
      const responseData = pythonResponse.data;
      const processingTime = Date.now() - startTime;

      console.log("✅ Quiz generated successfully!");
      console.log(`📊 Questions generated: ${responseData.quiz?.length || 0}`);
      console.log(`⏱️  Total processing time: ${processingTime}ms`);

      // 🔥 Store in Firebase
      try {
        console.log("🔥 Storing extracted data in Firebase...");
        
        const extractedDataDoc = {
          filename: req.file.originalname,
          fileSize: req.file.size,
          subject: quizParams.subject,
          difficulty: quizParams.difficulty,
          questionCount: responseData.quiz?.length || 0,
          
          // Store the generated questions
          questions: responseData.quiz || [],
          
          // Store metadata
          extractedMetadata: {
            textLength: responseData.metadata?.textLength,
            cleanedLength: responseData.metadata?.cleanedLength,
            pages: responseData.metadata?.pages,
            processingTime: processingTime,
            pythonProcessingTime: responseData.processingTime,
            fallbackUsed: responseData.metadata?.fallbackUsed || false
          },
          
          // Timestamps
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          
          // Status
          status: 'extracted' // extracted, quiz_created, active, completed
        };

        // Store in 'extractedData' collection
        const docRef = await db.collection('extractedData').add(extractedDataDoc);
        console.log('🔥 Extracted data stored with ID:', docRef.id);
        
        // Enhanced response structure with Firebase ID
        const result = {
          success: true,
          message: "Quiz generated and stored successfully",
          data: {
            quiz: responseData.quiz || [],
            firebaseId: docRef.id, // 🔥 Include Firebase document ID
            metadata: {
              filename: req.file.originalname,
              fileSize: req.file.size,
              questionsGenerated: responseData.quiz?.length || 0,
              processingTime: processingTime,
              pythonProcessingTime: responseData.processingTime,
              subject: quizParams.subject,
              difficulty: quizParams.difficulty,
              fallbackUsed: responseData.metadata?.fallbackUsed || false,
              extractedDataId: docRef.id // 🔥 Reference to Firebase document
            }
          }
        };

        res.json(result);
        
      } catch (firebaseError) {
        console.error('🔥 Firebase storage error:', firebaseError);
        
        // Still return the quiz data even if Firebase fails
        const result = {
          success: true,
          message: "Quiz generated successfully (storage warning)",
          warning: "Data could not be stored in database",
          data: {
            quiz: responseData.quiz || [],
            metadata: {
              filename: req.file.originalname,
              fileSize: req.file.size,
              questionsGenerated: responseData.quiz?.length || 0,
              processingTime: processingTime,
              pythonProcessingTime: responseData.processingTime,
              subject: quizParams.subject,
              difficulty: quizParams.difficulty,
              fallbackUsed: responseData.metadata?.fallbackUsed || false
            }
          }
        };

        res.json(result);
      }

    } else {
      // Handle 4xx errors from Python backend
      console.log(`❌ Python backend error (${pythonResponse.status}):`, pythonResponse.data);
      
      res.status(pythonResponse.status).json({ 
        success: false, 
        error: pythonResponse.data?.detail || pythonResponse.data?.error || "Failed to process PDF",
        pythonError: true
      });
    }

  } catch (error) {
    // Cleanup temp file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("🧹 Temp file cleaned up after error");
      } catch (cleanupErr) {
        console.log("⚠️  Could not cleanup temp file after error:", cleanupErr.message);
      }
    }

    console.error("❌ Upload processing error:", error.message);

    // Detailed error handling based on error type
    if (error.code === 'ECONNREFUSED') {
      console.log("❌ Cannot connect to Python backend");
      return res.status(503).json({ 
        success: false,
        error: "AI service is currently unavailable. Please ensure Python backend is running on port 8000.",
        hint: "Run: cd backend-python && python main.py"
      });
    }

    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        success: false,
        error: "Cannot reach AI service" 
      });
    }

    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      return res.status(504).json({ 
        success: false,
        error: "Request timed out. The PDF might be too complex to process." 
      });
    }

    if (error.response) {
      // Python backend returned an error
      console.log(`❌ Python backend error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      return res.status(error.response.status).json({ 
        success: false,
        error: error.response.data?.detail || error.response.data?.error || "Failed to process file",
        pythonError: true,
        details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
      });
    }

    // Generic error
    res.status(500).json({ 
      success: false,
      error: "Failed to process file",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🔥 New endpoint to get stored data
router.get("/extracted/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('extractedData').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: "Extracted data not found" 
      });
    }

    const data = doc.data();
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Error fetching extracted data:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch data" 
    });
  }
});

// 🔥 New endpoint to list all extracted data
router.get("/extracted", async (req, res) => {
  try {
    const { limit = 20, subject, status } = req.query;
    
    let query = db.collection('extractedData')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));
    
    if (subject) {
      query = query.where('subject', '==', subject);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const extractedData = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      extractedData.push({
        id: doc.id,
        filename: data.filename,
        subject: data.subject,
        questionCount: data.questionCount,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        status: data.status
      });
    });

    res.json({
      success: true,
      data: extractedData,
      total: extractedData.length
    });

  } catch (error) {
    console.error('❌ Error listing extracted data:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch data list" 
    });
  }
});

// Test endpoints for debugging
router.get("/test", (req, res) => {
  res.json({ 
    message: "Upload route is working!",
    timestamp: new Date().toISOString(),
    uploadDir: uploadDir
  });
});

router.get("/health", async (req, res) => {
  try {
    // Test connection to Python backend
    const pythonHealth = await axios.get("http://localhost:8000/health", { timeout: 5000 });
    
    res.json({ 
      status: "healthy",
      service: "Node.js Upload Service",
      pythonBackend: pythonHealth.status === 200 ? "connected" : "error",
      uploadDirectory: uploadDir,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: "partial",
      service: "Node.js Upload Service", 
      pythonBackend: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;