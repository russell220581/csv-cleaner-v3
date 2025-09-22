const CSVProcessor = require('./csvProcessor');
const { logger } = require('./logger');

class BatchProcessor {
  static async processFiles(files, operations, maxRows, user) {
    const results = [];

    for (const file of files) {
      try {
        const processor = new CSVProcessor(maxRows);
        const outputPath = `uploads/batch-${Date.now()}-${file.originalname}`;

        const result = await processor.processFile(
          file.path,
          outputPath,
          operations
        );

        results.push({
          originalName: file.originalname,
          processedName: outputPath,
          success: true,
          ...result,
        });

        // Update user usage
        await user.updateUsage(result.processedRows);
      } catch (error) {
        results.push({
          originalName: file.originalname,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = BatchProcessor;
