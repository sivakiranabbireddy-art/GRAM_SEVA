const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      default: null,
      index: true
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'WORKER', 'ADMIN', 'ALL'],
      default: 'ALL',
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
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

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
