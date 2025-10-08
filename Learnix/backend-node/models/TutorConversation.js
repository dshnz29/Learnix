const { Schema, model } = require('mongoose');

const TutorConversationSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'tutor'],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('TutorConversation', TutorConversationSchema);