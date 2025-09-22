const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    processedName: {
      type: String,
      required: true,
    },
    processingTier: {
      type: String,
      enum: ['free', 'pro', 'agency'],
      required: true,
    },
    originalRowCount: {
      type: Number,
      required: true,
    },
    deliveredRowCount: {
      type: Number,
      required: true,
    },
    wasTruncated: {
      type: Boolean,
      default: false,
    },
    sizeBefore: {
      type: Number,
      required: true,
    },
    sizeAfter: {
      type: Number,
      required: true,
    },
    processingTime: {
      type: Number,
      required: true,
    },
    operations: [
      {
        type: String,
        enum: [
          'trim',
          'remove_duplicates',
          'remove_empty',
          'change_case',
          'find_replace',
        ],
      },
    ],
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by user
fileSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);
