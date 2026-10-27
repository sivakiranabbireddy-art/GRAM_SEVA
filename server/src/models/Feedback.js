const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    bookingId: {
      type: String,
      required: true,
      index: true
    },
    customerId: {
      type: String,
      required: true,
      index: true
    },
    customerName: {
      type: String,
      default: ''
    },
    workerId: {
      type: String,
      default: null,
      index: true
    },
    workerName: {
      type: String,
      default: ''
    },
    categoryName: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    resolutionStatus: {
      type: String,
      default: 'RESOLVED'
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

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
