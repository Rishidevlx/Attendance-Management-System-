const mongoose = require('mongoose');

const verificationTokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['auto', 'manual'], // Token type
    },
    isActive: {
      type: Boolean,
      default: true, // Is this token currently the one to use?
    },
    expiresAt: {
      type: Date,
      required: true, // Token expiry time
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Add an index on expiresAt for efficient cleanup query
verificationTokenSchema.index({ expiresAt: 1 });
// Add an index for quickly finding the active token
verificationTokenSchema.index({ isActive: 1, type: 1 });


const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

module.exports = VerificationToken;
