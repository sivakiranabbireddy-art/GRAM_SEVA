const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      default: 'Wrench'
    },
    description: {
      type: String,
      default: ''
    },
    basePriceEstimate: {
      type: Number,
      default: 299
    },
    isActive: {
      type: Boolean,
      default: true
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

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
