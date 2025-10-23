const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    // --- NEW FIELD to control student login ---
    isActive: {
      type: Boolean,
      default: true,
    },
    age: {
      type: Number,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    domain: {
      type: String,
      required: false,
    },
    collegeName: {
      type: String,
      required: false,
    },
    howDidYouKnow: {
      type: String,
      required: false,
    },
    hasCompletedSurvey: {
      type: Boolean,
      default: false,
    },
    passwordResetOtp: {
      type: String,
      required: false, 
    },
    passwordResetExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
