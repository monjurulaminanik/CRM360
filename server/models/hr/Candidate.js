const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    
    name: { type: String, required: [true, 'Candidate name is required'], trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected'],
      default: 'applied',
    },
    
    resumeUrl: { type: String },
    coverLetter: { type: String },
    portfolioUrl: { type: String },
    
    notes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CandidateSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Candidate', CandidateSchema);
