const mongoose = require('mongoose');

const optionSchema = mongoose.Schema({
    text: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const informationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['message', 'poll'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      default: 'Admin',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinExpiresAt: {
      type: Date,
      default: null,
    },
    pollOptions: [optionSchema],
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
    // --- NEW: For Thumbs-up Feature ---
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // --- NEW: For one-time vote edit ---
    votersWhoEdited: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
  },
  {
    timestamps: true,
  }
);

const Information = mongoose.model('Information', informationSchema);

module.exports = Information;

