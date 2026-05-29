const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: [true, 'Leave type reference is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    allocated: {
      type: Number,
      default: 0,
    },
    used: {
      type: Number,
      default: 0,
    },
    pending: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available leave days
LeaveBalanceSchema.virtual('available').get(function () {
  return Math.max(0, this.allocated - this.used - this.pending);
});

// Compound unique index
LeaveBalanceSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
