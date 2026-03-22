const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema(
  {
    s3Key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerNickname: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'models',
  }
);

const Model3D = mongoose.model('Model3D', modelSchema);

module.exports = Model3D;