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
    // Включает автоматическое добавление полей createdAt и updatedAt
    timestamps: true,
    // Использует отдельную коллекцию 'appusers', чтобы избежать конфликта со старой коллекцией 'users' (в ней индекс email_1)
    collection: 'users',
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
