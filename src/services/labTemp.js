const os = require('os');
const path = require('path');
const fs = require('fs/promises');

// Base directory for Lab temporary files.
// Can be overridden via LAB_TMP_DIR env if needed.
const LAB_TMP_ROOT = process.env.LAB_TMP_DIR || path.join(os.tmpdir(), 'fitchi-lab');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Returns an absolute path for a temporary Lab file for a given user and S3 key.
 * The directory is created if it doesn't exist.
 *
 * @param {object} params
 * @param {string|number} params.userId - Identifier of the user/admin working in Lab.
 * @param {string} params.key - S3 object key (used to derive filename).
 * @returns {Promise<string>} Absolute path to a temp file on disk.
 */
async function getLabTempFilePath({ userId, key }) {
  const safeUser = String(userId || 'anonymous');
  const safeKey = String(key || 'asset').replace(/[^\w.\-]/g, '_');

  const userDir = path.join(LAB_TMP_ROOT, safeUser);
  await ensureDir(userDir);

  return path.join(userDir, safeKey);
}

/**
 * Deletes the temporary Lab file for the given user and S3 key.
 * Ignores ENOENT (file already missing).
 */
async function deleteLabTempFile({ userId, key }) {
  const tempPath = await getLabTempFilePath({ userId, key });
  try {
    await fs.unlink(tempPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

module.exports = {
  LAB_TMP_ROOT,
  getLabTempFilePath,
  deleteLabTempFile,
};

