const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Holiday name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required'],
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['public', 'optional', 'religious', 'national'],
      default: 'public',
    },
    description: {
      type: String,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Holiday', HolidaySchema);
