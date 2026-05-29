const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship', 'remote'],
      default: 'full_time',
    },
    
    status: {
      type: String,
      enum: ['open', 'closed', 'on_hold'],
      default: 'open',
    },
    
    positions: { type: Number, default: 1 },
    experience: { type: String }, // e.g., '2-3 years'
    location: { type: String },
    
    description: { type: String },
    requirements: { type: String },
    
    closingDate: { type: Date },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
