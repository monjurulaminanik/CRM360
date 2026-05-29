const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Designation title is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    level: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead', 'manager', 'director'],
      required: true,
      default: 'junior',
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

DesignationSchema.index({ title: 1 });

module.exports = mongoose.model('Designation', DesignationSchema);
