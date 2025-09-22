const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { validateTier, checkRowLimit } = require('../middleware/tierValidation');
const { getUploadMiddleware } = require('../middleware/upload');
const CSVProcessor = require('../utils/csvProcessor');
const User = require('../models/User');
const File = require('../models/File');
const { logger } = require('../utils/logger');

const router = express.Router();

// All routes in this file are protected
router.use(protect);
router.use(validateTier);
router.use(checkRowLimit);

// Upload and process CSV file
router.post('/', getUploadMiddleware, async (req, res, next) => {
  let fileRecord;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const startTime = Date.now();
    const inputPath = req.file.path;
    const outputFileName = `processed-${Date.now()}.csv`;
    const outputPath = path.join(
      process.env.UPLOAD_DIR || 'uploads',
      outputFileName
    );

    // Get operations from request body
    const operations = req.body.operations
      ? JSON.parse(req.body.operations)
      : ['trim', 'remove_empty'];

    // Create file record in database
    fileRecord = await File.create({
      user: req.user._id,
      originalName: req.file.originalname,
      processedName: outputFileName,
      processingTier: req.user.tier,
      operations: operations,
      status: 'processing',
    });

    // Process the CSV file
    const processor = new CSVProcessor(req.maxRows);
    const result = await processor.processFile(
      inputPath,
      outputPath,
      operations
    );

    // Get file sizes
    const sizeBefore = CSVProcessor.getFileSize(inputPath);
    const sizeAfter = CSVProcessor.getFileSize(outputPath);

    // Update file record with results
    fileRecord.originalRowCount = result.originalRowCount;
    fileRecord.deliveredRowCount = result.processedRows;
    fileRecord.wasTruncated = result.wasTruncated;
    fileRecord.sizeBefore = sizeBefore;
    fileRecord.sizeAfter = sizeAfter;
    fileRecord.processingTime = result.processingTime;
    fileRecord.status = 'completed';
    await fileRecord.save();

    // Update user usage statistics
    await req.user.updateUsage(result.processedRows);

    // Clean up input file
    fs.unlinkSync(inputPath);

    const processingTime = Date.now() - startTime;

    logger.info(
      `File processed: ${req.file.originalname}, Rows: ${result.processedRows}/${result.originalRowCount}, Time: ${processingTime}ms`
    );

    res.status(200).json({
      status: 'success',
      data: {
        file: {
          id: fileRecord._id,
          originalName: req.file.originalname,
          processedName: outputFileName,
          originalRowCount: result.originalRowCount,
          deliveredRowCount: result.processedRows,
          wasTruncated: result.wasTruncated,
          processingTime: result.processingTime,
          sizeBefore,
          sizeAfter,
          compressionRatio: (
            ((sizeBefore - sizeAfter) / sizeBefore) *
            100
          ).toFixed(2),
          downloadUrl: `/uploads/${outputFileName}`,
          operations: operations,
        },
        userTier: req.user.tier,
        limits: {
          maxRows: req.maxRows,
        },
      },
    });
  } catch (error) {
    logger.error('File processing error:', error);

    // Update file record with error
    if (fileRecord) {
      fileRecord.status = 'failed';
      fileRecord.errorMessage = error.message;
      await fileRecord.save();
    }

    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    next(error);
  }
});

// Download processed file
router.get('/download/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

    // Verify user owns this file
    const fileRecord = await File.findOne({
      processedName: filename,
      user: req.user._id,
    });

    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileRecord.originalName}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error('File download error:', error);
    next(error);
  }
});

// Get file processing status
router.get('/status/:fileId', async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const fileRecord = await File.findOne({
      _id: fileId,
      user: req.user._id,
    });

    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        file: fileRecord,
      },
    });
  } catch (error) {
    logger.error('File status error:', error);
    next(error);
  }
});

module.exports = router;
