const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Property owner ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: ['Room', 'PG', 'Flat', 'Shared'],
        message: 'Type must be Room, PG, Flat, or Shared',
      },
    },
    price: {
      type: Number,
      required: [true, 'Property price per month is required'],
      min: [0, 'Price must be a positive number'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    facilities: {
      type: [String],
      default: [],
    },
    address: {
      type: String,
      required: [true, 'Property address is required'],
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    propertyCode: {
      type: String,
      unique: true,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient search queries
propertySchema.index({ type: 1, price: 1, isActive: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
