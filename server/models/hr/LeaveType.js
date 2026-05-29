const mongoose = require('mongoose');

const LeaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Leave type name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Leave type code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    color: {
      type: String,
      default: '#2D55FF',
    },
    daysAllowedPerYear: {
      type: Number,
      required: true,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    carryForward: {
      type: Boolean,
      default: false,
    },
    maxCarryForward: {
      type: Number,
      default: 0,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    requiresDocument: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveType', LeaveTypeSchema);
