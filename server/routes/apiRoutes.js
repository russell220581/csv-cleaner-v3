const express = require('express');
const { apiAuth } = require('../middleware/apiAuth');
const { checkRowLimit } = require('../middleware/tierValidation');
const CSVProcessor = require('../utils/csvProcessor');
const User = require('../models/User');
const File = require('../models/File');
const { logger } = require('../utils/logger');

const router = express.Router();

router.use(apiAuth);
router.use(checkRowLimit);

// API endpoint for CSV processing
router.post('/process', async (req, res, next) => {
  try {
    const { csvData, operations } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    // Create temporary files
    const inputPath = `uploads/api-input-${Date.now()}.csv`;
    const outputPath = `uploads/api-output-${Date.now()}.csv`;

    require('fs').writeFileSync(inputPath, csvData);

    // Process CSV
    const processor = new CSVProcessor(req.maxRows);
    const result = await processor.processFile(
      inputPath,
      outputPath,
      operations
    );

    // Read processed data
    const processedData = require('fs').readFileSync(outputPath, 'utf8');

    // Cleanup
    require('fs').unlinkSync(inputPath);
    require('fs').unlinkSync(outputPath);

    // Update usage
    await req.user.updateUsage(result.processedRows, true);

    res.json({
      success: true,
      data: processedData,
      stats: result,
    });
  } catch (error) {
    next(error);
  }
});

// API usage stats
router.get('/usage', async (req, res) => {
  res.json({
    usage: req.user.usage,
    tier: req.user.tier,
    limits: {
      maxRows: req.maxRows,
    },
  });
});

module.exports = router;
