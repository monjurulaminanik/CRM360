const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    checkInIp: {
      type: String,
    },
    checkOutIp: {
      type: String,
    },
    checkInLocation: {
      lat: Number,
      lng: Number,
    },
    checkOutLocation: {
      lat: Number,
      lng: Number,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave', 'holiday', 'weekend'],
      required: true,
      default: 'present',
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },
    notes: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for workingHours (in decimal hours)
AttendanceSchema.virtual('workingHours').get(function () {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
  return 0;
});

// Compound unique index for employee + date
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
