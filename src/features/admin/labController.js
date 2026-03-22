const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const { pipeline } = require('stream/promises');

const s3Service = require('../cloudR2/services/s3Service');
const { getLabTempFilePath } = require('../../services/labTemp');

function getDefaultBucket() {
  return process.env.BUCKET_NAME;
}

/**
 * Prepare a Lab temp file from an S3 object.
 * Expects JSON body: { key: "s3/object/key.gltf" }.
 */
async function openFromS3(req, res) {
  const bucket = getDefaultBucket();
  if (!bucket) {
    return res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
  }

  const key = String(req.body?.key || '').trim();
  if (!key) {
    return res.status(400).json({ error: 'Missing S3 key' });
  }

  try {
    // TODO: replace with real authenticated user id when auth middleware is wired
    const userId = req.user?.id || 'admin';

    const tempPath = await getLabTempFilePath({ userId, key });
    console.log('[Lab] Preparing temp file from S3', {
      bucket,
      key,
      userId,
      tempPath,
    });

    const { body, contentType } = await s3Service.getObject(bucket, key);

    await pipeline(body, fs.createWriteStream(tempPath));
    console.log('[Lab] Temp file ready for editing', { key, tempPath });

    return res.json({
      key,
      contentType: contentType || null,
      // we intentionally do not expose absolute server paths to the client as part of API contract
      prepared: true,
    });
  } catch (err) {
    console.error('Lab openFromS3 error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to prepare Lab file from S3' });
  }
}

/**
 * Save the prepared Lab temp file back to S3, overwriting the original object.
 * Expects JSON body:
 * {
 *   key: "s3/object/key.gltf",
 *   settings: {
 *     backgroundColor, exposure,
 *     ambientIntensity, directionalIntensity,
 *     minDistance, maxDistance, dampingFactor,
 *     cameraFov
 *   }
 * }
 */
async function saveToS3(req, res) {
  const bucket = getDefaultBucket();
  if (!bucket) {
    return res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
  }

  const key = String(req.body?.key || '').trim();
  if (!key) {
    return res.status(400).json({ error: 'Missing S3 key' });
  }

  const settings = req.body?.settings || null;

  try {
    // TODO: replace with real authenticated user id when auth middleware is wired
    const userId = req.user?.id || 'admin';

    const tempPath = await getLabTempFilePath({ userId, key });

    // Ensure temp file exists before attempting to upload
    await fsPromises.access(tempPath);

    const isGltfJson = key.toLowerCase().endsWith('.gltf');

    if (settings && isGltfJson) {
      // Patch .gltf JSON: embed Panel Lab settings into extras.panelLab
      const raw = await fsPromises.readFile(tempPath, 'utf8');
      let json;
      try {
        json = JSON.parse(raw);
      } catch (e) {
        console.warn('[Lab] Failed to parse .gltf as JSON, skipping settings patch:', e.message);
        json = null;
      }

      if (json && typeof json === 'object') {
        json.extras = json.extras || {};
        json.extras.panelLab = {
          ...(json.extras.panelLab || {}),
          ...settings,
        };

        const updated = JSON.stringify(json);
        await fsPromises.writeFile(tempPath, updated, 'utf8');
      }
    }

    const bodyStream = fs.createReadStream(tempPath);

    await s3Service.upload(bucket, key, bodyStream, 'model/gltf+json');

    console.log('[Lab] Temp file saved back to S3', {
      bucket,
      key,
      userId,
      tempPath,
    });

    return res.json({
      key,
      saved: true,
    });
  } catch (err) {
    console.error('Lab saveToS3 error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to save Lab file back to S3' });
  }
}

module.exports = {
  openFromS3,
  saveToS3,
};

