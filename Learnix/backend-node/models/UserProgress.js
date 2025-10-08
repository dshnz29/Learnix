const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  quizAttempts: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Quiz'
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'QuizAttempt'
    },
    score: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  performanceMetrics: {
    averageScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    lastAttemptDate: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

UserProgressSchema.methods.updatePerformance = function(score) {
  this.performanceMetrics.totalAttempts += 1;
  this.performanceMetrics.averageScore = ((this.performanceMetrics.averageScore * (this.performanceMetrics.totalAttempts - 1)) + score) / this.performanceMetrics.totalAttempts;
  this.performanceMetrics.lastAttemptDate = Date.now();
};

module.exports = mongoose.model('UserProgress', UserProgressSchema);