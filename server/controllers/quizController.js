const fs = require('fs').promises;
const pdf = require('pdf-parse');
const { generateQuestions } = require('../services/geminiService');
const Quiz = require('../models/Quiz');

const processPDF = async (base64Data, filename) => {
  try {
    if (!base64Data) {
      throw new Error('No file data received');
    }

    // Validate base64 string
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64Data)) {
      throw new Error('Invalid file encoding');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const tempPath = `./uploads/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    await fs.writeFile(tempPath, buffer);
    const dataBuffer = await fs.readFile(tempPath);
    
    // Validate PDF content
    if (dataBuffer.length === 0) {
      throw new Error('Empty PDF file');
    }

    const pdfData = await pdf(dataBuffer);
    await fs.unlink(tempPath);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('PDF appears to be empty or could not be parsed');
    }

    return pdfData.text.substring(0, 100000); // Limit to first 100k chars
  } catch (error) {
    console.error('PDF Processing Error:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
};

exports.uploadQuiz = async (req, res) => {
  try {
    console.log('Upload request received with file size:', req.body.file?.length || 0);

    const { file, filename, subject, duration, questionCount } = req.body;
    
    if (!file || !filename) {
      return res.status(400).json({
        success: false,
        message: 'File data and filename are required'
      });
    }

    const pdfText = await processPDF(file, filename);
    console.log('PDF processed successfully, generating questions...');
    
    const questions = await generateQuestions(pdfText, parseInt(questionCount));
    console.log(`Generated ${questions.length} questions`);

    const quizId = await Quiz.createQuiz({
      title: filename.replace(/\.[^/.]+$/, ''),
      subject,
      duration,
      questionCount,
      questions: JSON.stringify(questions)
    });

    res.json({
      success: true,
      quizId,
      questions,
      message: 'Quiz generated successfully'
    });
  } catch (error) {
    console.error('Error in uploadQuiz:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate quiz',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};