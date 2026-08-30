const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant is required'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    requestedDate: {
      type: String,
      required: [true, 'Requested date is required'],
    },
    requestedTimeSlot: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
      required: [true, 'Time slot is required'],
    },
    note: {
      type: String,
      default: '',
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const VisitRequest = mongoose.model('VisitRequest', visitRequestSchema);

module.exports = VisitRequest;
