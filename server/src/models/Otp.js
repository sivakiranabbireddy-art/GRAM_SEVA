const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Number,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Auto-expire documents after 1 hour using MongoDB TTL index
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;
