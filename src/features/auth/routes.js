const express = require('express');
const { registerUser, loginUser } = require('./service');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { nickname, password, role } = req.body || {};
    await registerUser({ nickname, password, role: role || 'user' });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    const status = err.status || 500;
    const message = err.status ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);
    if (status === 500) console.error('POST /api/auth/register error:', err);
    return res.status(status).json({ message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await loginUser(req.body || {});
    return res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    const status = err.status || 500;
    const message = err.status ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);
    if (status === 500) console.error('POST /api/auth/login error:', err);
    return res.status(status).json({ message });
  }
});

module.exports = router;
