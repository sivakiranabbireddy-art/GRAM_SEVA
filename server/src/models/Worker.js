const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    skills: {
      type: [String],
      default: []
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    serviceArea: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING_APPROVAL', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING_APPROVAL',
      index: true
    },
    averageRating: {
      type: Number,
      default: 5.0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalCompletedBookings: {
      type: Number,
      default: 0
    },
    earningsTotal: {
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

const Worker = mongoose.model('Worker', workerSchema);
module.exports = Worker;
