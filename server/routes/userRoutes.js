const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const File = require('../models/File');
const { logger } = require('../utils/logger');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Get current user profile
router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          tier: user.tier,
          subscriptionStatus: user.subscriptionStatus,
          usage: user.usage,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    next(error);
  }
});

// Get user usage statistics
router.get('/usage', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: 'success',
      data: {
        usage: user.usage,
        tier: user.tier,
        limits: {
          maxFileSize:
            user.tier === 'free'
              ? parseInt(process.env.FREE_TIER_MAX_SIZE)
              : 'Unlimited',
          maxRows:
            user.tier === 'free'
              ? parseInt(process.env.FREE_TIER_MAX_ROWS)
              : 'Unlimited',
        },
      },
    });
  } catch (error) {
    logger.error('Get user usage error:', error);
    next(error);
  }
});

// Get user's file processing history
router.get('/files', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const files = await File.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-user'); // Exclude user field

    const total = await File.countDocuments({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      data: {
        files,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    logger.error('Get user files error:', error);
    next(error);
  }
});

module.exports = router;
