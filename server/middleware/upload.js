const multer = require('multer');
const path = require('path');
const { logger } = require('../utils/logger');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || 'uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter for CSV files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// Create upload middleware with tier-based size limits
const createUpload = (maxSize) =>
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  });

// Middleware to get appropriate upload based on user tier
const getUploadMiddleware = (req, res, next) => {
  let maxSize;

  switch (req.user.tier) {
    case 'pro':
    case 'agency':
      maxSize = 100 * 1024 * 1024; // 100MB for paid tiers
      break;
    case 'free':
    default:
      maxSize = parseInt(process.env.FREE_TIER_MAX_SIZE) || 5 * 1024 * 1024; // 5MB for free
  }

  const upload = createUpload(maxSize);

  // Use single file upload with field name 'csvFile'
  upload.single('csvFile')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `File too large. Maximum size allowed for ${
            req.user.tier
          } tier: ${maxSize / (1024 * 1024)}MB`,
        });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = { getUploadMiddleware };
