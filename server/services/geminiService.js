const axios = require('axios');
require('dotenv').config();

exports.generateQuizQuestions = async (text) => {
  const prompt = `
Generate 5 multiple-choice quiz questions based on the following text. 
Respond in JSON format like:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "B"
  },
  ...
]
Text:
${text}
`;

  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  const rawText = response.data.candidates[0].content.parts[0].text;
  return JSON.parse(rawText);
};
