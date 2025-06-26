const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'tired', 'stressed']
  },
  sentimentScore: {
    type: Number,
    required: true,
    min: -1,
    max: 1
  },
  aiFeedback: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
journalEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema); 