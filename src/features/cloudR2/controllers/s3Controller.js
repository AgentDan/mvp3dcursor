const s3Service = require('../services/s3Service');
const User = require('../../auth/user.model');
const { createModel, deleteModelByS3Key } = require('../../models/service');

function getDefaultBucket() {
  return process.env.BUCKET_NAME;
}

async function list(req, res) {
  const bucket = req.params.bucket || getDefaultBucket();
  if (!bucket) {
    return res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
  }
  try {
    const contents = await s3Service.listObjects(bucket);
    res.json({ objects: contents, count: contents.length });
  } catch (err) {
    console.error('S3 error:', err.message);
    const hint = err.message && err.message.includes('does not exist')
      ? ' Call GET /s3 to see valid bucket names.'
      : '';
    res.status(500).json({ error: err.message + hint });
  }
}

async function upload(req, res) {
  const bucket = getDefaultBucket();
  if (!bucket) {
    return res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const key = (req.body && req.body.key && req.body.key.trim()) || req.file.originalname;
  const ownerNickname = req.body && typeof req.body.ownerNickname === 'string'
    ? req.body.ownerNickname.trim()
    : '';
  try {
    await s3Service.upload(bucket, key, req.file.buffer, req.file.mimetype);

    // If owner nickname is provided and this is a .gltf/.glb, create or update a Model3D record
    const lowerKey = String(key).toLowerCase();
    if (ownerNickname && (lowerKey.endsWith('.gltf') || lowerKey.endsWith('.glb'))) {
      try {
        const user = await User.findOne({ nickname: ownerNickname }).lean();
        if (user && user._id) {
          await createModel({
            s3Key: key,
            ownerUserId: user._id,
            ownerNickname: user.nickname,
          });
        }
      } catch (e) {
        console.error('Failed to link uploaded model to user:', e.message);
      }
    }

    res.json({ key, size: req.file.size });
  } catch (err) {
    console.error('S3 upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function download(req, res) {
  const bucket = getDefaultBucket();
  if (!bucket) {
    return res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
  }
  const key = decodeURIComponent(req.params.key);
  try {
    const url = await s3Service.getDownloadUrl(bucket, key, 3600);
    res.json({ url });
  } catch (err) {
    console.error('S3 download error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  const bucket = getDefaultBucket();
  if (!bucket) {
    return res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
  }
  const key = decodeURIComponent(req.params.key);
  try {
    await s3Service.deleteObject(bucket, key);
    let dbRemoved = false;
    try {
      const { deletedCount } = await deleteModelByS3Key(key);
      dbRemoved = deletedCount > 0;
    } catch (dbErr) {
      console.error('S3 object deleted but Model3D DB delete failed:', dbErr.message);
      return res.status(200).json({
        deleted: key,
        dbRemoved: false,
        warning: 'File removed from S3 but the database record could not be deleted. Check server logs.',
      });
    }
    res.json({ deleted: key, dbRemoved });
  } catch (err) {
    console.error('S3 delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function stream(req, res) {
  const bucket = getDefaultBucket();
  if (!bucket) {
    return res.status(500).json({ error: 'Set BUCKET_NAME in .env' });
  }
  const key = decodeURIComponent(req.params.key);
  try {
    const { body, contentType } = await s3Service.getObject(bucket, key);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    if (contentType) res.setHeader('Content-Type', contentType);
    body.pipe(res);
  } catch (err) {
    console.error('S3 stream error:', err.message);
    const notFound =
      err?.name === 'NoSuchKey' ||
      err?.Code === 'NoSuchKey' ||
      err?.$metadata?.httpStatusCode === 404 ||
      /does not exist/i.test(String(err?.message || ''));
    res.status(notFound ? 404 : 500).json({ error: err.message });
  }
}

module.exports = {
  list,
  upload,
  download,
  stream,
  remove,
};
