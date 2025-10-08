const { Schema, model } = require('mongoose');

const quizAttemptSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  quizId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  attemptDate: {
    type: Date,
    default: Date.now,
  },
  performanceAnalysis: {
    type: Object,
    default: {},
  },
  feedback: {
    type: String,
    default: '',
  },
  aiTutorConversationId: {
    type: String,
    default: null,
  },
});

module.exports = model('QuizAttempt', quizAttemptSchema);