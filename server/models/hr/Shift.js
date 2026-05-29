const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shift name is required'],
      unique: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Shift start time is required (e.g. "09:00")'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'Shift end time is required (e.g. "18:00")'],
      trim: true,
    },
    breakDuration: {
      type: Number, // in minutes
      default: 60,
    },
    lateMarkAfter: {
      type: Number, // in minutes from startTime
      default: 15,
    },
    halfDayAfter: {
      type: Number, // in minutes from startTime
      default: 120,
    },
    workingDays: {
      type: [Number], // array of weekdays: 0 (Sun) to 6 (Sat)
      default: [1, 2, 3, 4, 5], // Monday to Friday
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', ShiftSchema);
