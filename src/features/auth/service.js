const bcrypt = require('bcryptjs');
const User = require('./user.model');

const ROLES = User.ROLES || ['user', 'administrator'];

async function registerUser({ nickname, password, role = 'user' }) {
  if (!nickname || !password) {
    const err = new Error('Nickname and password are required');
    err.status = 400;
    throw err;
  }

  const trimmedNickname = String(nickname).trim();
  if (!trimmedNickname) {
    const err = new Error('Nickname is required');
    err.status = 400;
    throw err;
  }

  if (password.length < 1) {
    const err = new Error('Password must be at least 1 character');
    err.status = 400;
    throw err;
  }

  if (!ROLES.includes(role)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ nickname: trimmedNickname });
  if (existing) {
    const err = new Error('User with this nickname already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ nickname: trimmedNickname, passwordHash, role });
}

async function loginUser({ nickname, password }) {
  if (!nickname || !password) {
    const err = new Error('Nickname and password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ nickname: String(nickname).trim() });
  if (!user) {
    const err = new Error('Invalid nickname or password');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error('Invalid nickname or password');
    err.status = 401;
    throw err;
  }

  return {
    id: user._id.toString(),
    nickname: user.nickname,
    role: user.role,
  };
}

module.exports = { registerUser, loginUser };
