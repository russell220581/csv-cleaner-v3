const mongoose = require('mongoose');
const crypto = require('crypto');

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['password_reset', 'email_verification'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete expired tokens
    },
  },
  {
    timestamps: true,
  }
);

// Generate random token
tokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

// Create index for faster lookups
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1, type: 1 });

module.exports = mongoose.model('Token', tokenSchema);
