const mongoose = require('mongoose');

const ROLES = ['user', 'administrator'];

const userSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
    },
  },
  {
    // Adds createdAt and updatedAt automatically
    timestamps: true,
    // Uses the 'users' collection (aligned with existing DB; adjust if you need a separate collection)
    collection: 'users',
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
