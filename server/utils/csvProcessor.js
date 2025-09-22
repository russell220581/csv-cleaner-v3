const fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const { logger } = require('./logger');

class CSVProcessor {
  constructor(maxRows = 0) {
    this.maxRows = maxRows; // 0 means unlimited
    this.processedRows = 0;
    this.originalRowCount = 0;
    this.wasTruncated = false;
  }

  // Basic cleaning operations
  static operations = {
    trim: (row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value,
        ])
      );
    },

    remove_empty: (row) => {
      const hasData = Object.values(row).some(
        (value) => value !== null && value !== undefined && value !== ''
      );
      return hasData ? row : null;
    },

    change_case: (row, operation = 'lower') => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (typeof value === 'string') {
            switch (operation) {
              case 'upper':
                return [key, value.toUpperCase()];
              case 'lower':
                return [key, value.toLowerCase()];
              case 'title':
                return [
                  key,
                  value.replace(
                    /\w\S*/g,
                    (txt) =>
                      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  ),
                ];
              default:
                return [key, value];
            }
          }
          return [key, value];
        })
      );
    },
  };

  async processFile(inputPath, outputPath, operations = ['trim']) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(inputPath);
      const writeStream = fs.createWriteStream(outputPath);

      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const stringifier = stringify({
        header: true,
        quoted: true,
      });

      parser.on('readable', () => {
        let row;
        while ((row = parser.read()) !== null) {
          this.originalRowCount++;

          // Apply operations
          let processedRow = row;
          for (const operation of operations) {
            if (operation === 'trim') {
              processedRow = CSVProcessor.operations.trim(processedRow);
            } else if (operation === 'remove_empty') {
              processedRow = CSVProcessor.operations.remove_empty(processedRow);
              if (!processedRow) break; // Skip empty rows
            } else if (operation.startsWith('change_case:')) {
              const caseType = operation.split(':')[1];
              processedRow = CSVProcessor.operations.change_case(
                processedRow,
                caseType
              );
            }
          }

          // Check if row was filtered out
          if (!processedRow) continue;

          // Check row limit for free tier
          if (this.maxRows > 0 && this.processedRows >= this.maxRows) {
            this.wasTruncated = true;
            break;
          }

          // Write processed row
          if (processedRow) {
            stringifier.write(processedRow);
            this.processedRows++;
          }
        }
      });

      parser.on('end', () => {
        stringifier.end();
      });

      parser.on('error', (error) => {
        reject(error);
      });

      stringifier.on('error', (error) => {
        reject(error);
      });

      writeStream.on('finish', () => {
        const processingTime = Date.now() - startTime;
        resolve({
          originalRowCount: this.originalRowCount,
          processedRows: this.processedRows,
          wasTruncated: this.wasTruncated,
          processingTime,
        });
      });

      // Pipe the streams
      readStream.pipe(parser).on('error', reject);
      stringifier.pipe(writeStream).on('error', reject);
    });
  }

  // Get file size in bytes
  static getFileSize(path) {
    return fs.statSync(path).size;
  }
}

module.exports = CSVProcessor;
