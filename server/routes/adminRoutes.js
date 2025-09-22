const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const File = require('../models/File');
const { logger } = require('../utils/logger');

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  // For now, we'll check a simple admin flag or email
  // In production, you'd have a proper role system
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',')
    : ['admin@csvcleaner.com'];

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.use(requireAdmin);

// Get all users with pagination
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      'usage.lastProcessingDate': {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });
    const paidUsers = await User.countDocuments({
      tier: { $in: ['pro', 'agency'] },
    });
    const totalFiles = await File.countDocuments();
    const totalRows = await File.aggregate([
      { $group: { _id: null, total: { $sum: '$deliveredRowCount' } } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          paid: paidUsers,
          free: totalUsers - paidUsers,
        },
        processing: {
          totalFiles,
          totalRows: totalRows[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user tier (manual override)
router.patch('/users/:userId/tier', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { tier } = req.body;

    if (!['free', 'pro', 'agency'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { tier },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Get system metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const signups = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const processing = await File.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          files: { $sum: 1 },
          rows: { $sum: '$deliveredRowCount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        signups,
        processing,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
