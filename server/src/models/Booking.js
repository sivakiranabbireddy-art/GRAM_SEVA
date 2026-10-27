const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    note: { type: String, default: '' },
    by: { type: String, default: 'System' }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
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
    customerPhone: {
      type: String,
      default: ''
    },
    customerAddress: {
      type: String,
      default: ''
    },
    locality: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    categoryId: {
      type: String,
      default: 'cat_general'
    },
    categoryName: {
      type: String,
      default: 'General Service'
    },
    description: {
      type: String,
      required: true
    },
    preferredDate: {
      type: String,
      required: true
    },
    preferredTimeSlot: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      default: ''
    },
    attachmentUrl: {
      type: String,
      default: ''
    },
    priceEstimate: {
      type: Number,
      default: 299
    },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'WORKER_ASSIGNED',
        'ACCEPTED',
        'REJECTED_BY_WORKER',
        'IN_PROGRESS',
        'AWAITING_CONFIRMATION',
        'COMPLETED',
        'CANCELLED',
        'DISPUTED'
      ],
      default: 'REQUESTED',
      index: true
    },
    assignedWorkerId: {
      type: String,
      default: null,
      index: true
    },
    assignedWorkerName: {
      type: String,
      default: null
    },
    assignedWorkerPhone: {
      type: String,
      default: null
    },
    cancelReason: {
      type: String,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },
    lastRejectedWorkerId: {
      type: String,
      default: null
    },
    completionNote: {
      type: String,
      default: null
    },
    completionTime: {
      type: String,
      default: null
    },
    disputeReason: {
      type: String,
      default: null
    },
    disputeCreatedAt: {
      type: String,
      default: null
    },
    disputeResolution: {
      type: String,
      default: null
    },
    timeline: {
      type: [timelineItemSchema],
      default: []
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

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
