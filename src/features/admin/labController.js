const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const { pipeline } = require('stream/promises');
const { pathToFileURL } = require('url');

const s3Service = require('../cloudR2/services/s3Service');
const { getLabTempFilePath, deleteLabTempFile } = require('../../services/labTemp');

let panelLabSchemaModulePromise;
async function loadPanelLabSchema() {
  if (!panelLabSchemaModulePromise) {
    const schemaUrl = pathToFileURL(path.join(__dirname, '../../../shared/panelLabSchema.mjs')).href;
    panelLabSchemaModulePromise = import(schemaUrl);
  }
  return panelLabSchemaModulePromise;
}

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
 *   panelLab: nested extras.panelLab object (schemaVersion, environment, lights, controls, camera)
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

  const panelLabInput = req.body?.panelLab ?? null;

  try {
    // TODO: replace with real authenticated user id when auth middleware is wired
    const userId = req.user?.id || 'admin';

    const tempPath = await getLabTempFilePath({ userId, key });

    // Ensure temp file exists before attempting to upload
    await fsPromises.access(tempPath);

    const isGltfJson = key.toLowerCase().endsWith('.gltf');

    if (panelLabInput && isGltfJson) {
      const { toCleanEmbeddedPanelLab } = await loadPanelLabSchema();
      // Patch .gltf JSON: extras.panelLab is nested only (no flat keys at the root).
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
        json.extras.panelLab = toCleanEmbeddedPanelLab(panelLabInput);

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

/**
 * Close Lab session and delete temp file, if present.
 * Expects JSON body: { key: "s3/object/key.gltf" }.
 */
async function closeLab(req, res) {
  const key = String(req.body?.key || '').trim();
  if (!key) {
    return res.status(400).json({ error: 'Missing S3 key' });
  }

  try {
    // TODO: replace with real authenticated user id when auth middleware is wired
    const userId = req.user?.id || 'admin';
    await deleteLabTempFile({ userId, key });
    return res.json({ key, closed: true });
  } catch (err) {
    console.error('Lab close error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to close Lab session' });
  }
}

module.exports = {
  openFromS3,
  saveToS3,
  closeLab,
};

