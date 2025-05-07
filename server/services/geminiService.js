const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateQuestions = async (text, questionCount = 10) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Generate exactly ${questionCount} multiple-choice questions based on:
      ${text}
      
      Format as JSON array with:
      - question (string)
      - options (array of 4 strings)
      - answer (string matching one option)
      
      Example:
      [{
        "question": "What is 2+2?",
        "options": ["3", "4", "5", "6"],
        "answer": "4"
      }]
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Extract JSON from response
    const jsonStart = textResponse.indexOf('[');
    const jsonEnd = textResponse.lastIndexOf(']') + 1;
    const jsonString = textResponse.slice(jsonStart, jsonEnd);

    const questions = JSON.parse(jsonString);

    // Validate questions
    if (!Array.isArray(questions) || questions.length !== questionCount) {
      throw new Error('Invalid questions format returned from API');
    }

    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Question generation failed: ${error.message}`);
  }
};

module.exports = { generateQuestions };