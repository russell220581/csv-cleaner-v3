const User = require('../models/User');
const { logger } = require('../utils/logger');

const apiAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (user.tier === 'free') {
      return res
        .status(403)
        .json({ error: 'API access requires Pro or Agency tier' });
    }

    req.user = user;
    req.isApiRequest = true;
    next();
  } catch (error) {
    logger.error('API auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { apiAuth };
