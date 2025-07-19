//const PDFMerger = require('pdf-merger-js');
const path = require('path');
const fs = require('fs');

/**
 * Merge multiple PDFs into a single file
 * @param {string[]} inputPaths - Array of full PDF file paths in merge order
 * @param {string} outputPath - Full path to save the merged PDF
 * @returns {Promise<boolean>} - Returns true if successful
 */
async function pdfMerge(inputPaths, outputPath) {
  const { default: PDFMerger } = await import('pdf-merger-js'); // dynamic ESM import
  const merger = new PDFMerger();

  try {
    for (const file of inputPaths) {
      if (fs.existsSync(file)) {
        await merger.add(file);
      } else {
        console.warn(`⚠️ File not found: ${file}`);
      }
    }

    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    await merger.save(outputPath);
    return true;
  } catch (err) {
    console.error('❌ Failed to merge PDFs:', err.message);
    return false;
  }
}

module.exports = {
  ...module.exports,
  pdfMerge
};

/**
 * Deletes all batch temp files (.jsx and .pdf) from batch folders.
 * @returns {object} cleanup status
 */
function cleanupBatchTemp() {
  const configDir = path.resolve(__dirname, 'TempConfig');
  const tempPDFDir = path.join(configDir, 'TempPDF');

  let removed = [];

  try {
    // Delete all .jsx files in TempConfig
    if (fs.existsSync(configDir)) {
      for (const file of fs.readdirSync(configDir)) {
        if (file.endsWith('.jsx') || file === 'sentinal_batch_status.txt') {
          const filePath = path.join(configDir, file);
          fs.unlinkSync(filePath);
          removed.push(filePath);
        }
      }
    }

    // Delete all .pdf files in TempConfig/TempPDF
    if (fs.existsSync(tempPDFDir)) {
      for (const file of fs.readdirSync(tempPDFDir)) {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(tempPDFDir, file);
          fs.unlinkSync(filePath);
          removed.push(filePath);
        }
      }
    }

    return { success: true, removed };
  } catch (err) {
    console.error('❌ Batch cleanup failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  ...module.exports,
  cleanupBatchTemp
};
