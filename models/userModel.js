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
    // --- THE NEW "GATEKEEPER" FIELD ---
    hasCompletedSurvey: {
      type: Boolean,
      default: false,
    },
    passwordResetOtp: {
      type: String,
      required: false, 
    },
    passwordResetExpires: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

