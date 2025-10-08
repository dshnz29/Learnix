const { Schema, model } = require('mongoose');

const LearningAnalyticsSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  quizAttempts: [
    {
      quizId: {
        type: String,
        required: true,
      },
      attemptId: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  performanceMetrics: {
    accuracy: {
      type: Number,
      required: true,
    },
    averageScore: {
      type: Number,
      required: true,
    },
    improvement: {
      type: Number,
      required: true,
    },
  },
  aiTutorInteractions: [
    {
      conversationId: {
        type: String,
        required: true,
      },
      messages: [
        {
          sender: {
            type: String,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
});

module.exports = model('LearningAnalytics', LearningAnalyticsSchema);