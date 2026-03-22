const express = require('express');
const { openFromS3, saveToS3 } = require('./labController');
const User = require('../auth/user.model');

const router = express.Router();

// Admin Lab: prepare a temp file from S3 object for Lab editing
router.post('/lab/from-s3', express.json(), openFromS3);

// Admin Lab: save prepared temp file back to S3 (overwrite)
router.post('/lab/save-to-s3', express.json(), saveToS3);

// List all users (for admin Users page)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    const mapped = (users || []).map((u) => ({
      id: u._id?.toString(),
      nickname: u.nickname,
      role: u.role,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt || null,
    }));
    return res.json({ users: mapped });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return res.status(500).json({ message: 'Failed to load users' });
  }
});

// Delete user by id (or, as a fallback, by nickname)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    // First, try to treat param as Mongo ObjectId
    let deleted = null;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(id));
    if (isObjectId) {
      deleted = await User.findByIdAndDelete(id);
    }

    // If nothing deleted by id, try delete by nickname (unique login)
    if (!deleted) {
      deleted = await User.findOneAndDelete({ nickname: id });
    }

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('DELETE /api/admin/users/:id error:', err);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Other admin routes (users, roles, etc.) can be added here

module.exports = router;
