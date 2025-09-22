const { logger } = require('../utils/logger');

const validateTier = (req, res, next) => {
  const user = req.user;

  // Check if user has active subscription for paid tiers
  if (user.tier !== 'free' && user.subscriptionStatus !== 'active') {
    return res.status(403).json({
      error:
        'Subscription required. Please upgrade your account to access this feature.',
    });
  }

  next();
};

// Middleware to check if user can process more rows
const checkRowLimit = (req, res, next) => {
  const user = req.user;

  if (user.tier === 'free') {
    const maxRows = parseInt(process.env.FREE_TIER_MAX_ROWS) || 500;
    req.maxRows = maxRows;
  } else {
    // Paid tiers have no limits
    req.maxRows = 0; // 0 means unlimited
  }

  next();
};

module.exports = { validateTier, checkRowLimit };
