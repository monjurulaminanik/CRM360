const mongoose = require('mongoose');

// Counter for change request IDs
const CRCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const CRCounter = mongoose.models.CRCounter || mongoose.model('CRCounter', CRCounterSchema);

const ChangeRequestSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    changeRequestId: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    justification: { type: String },

    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestDate: { type: Date, default: Date.now },

    type: {
      type: String,
      enum: ['scope', 'schedule', 'budget', 'quality', 'resource', 'other'],
      default: 'scope',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // ── Impact Analysis ──
    impactAnalysis: {
      scopeImpact: { type: String },
      scheduleImpact: { type: Number }, // days added/removed
      budgetImpact: { type: Number },   // amount added/removed
      resourceImpact: { type: String },
      qualityImpact: { type: String },
      riskImpact: { type: String },
    },

    proposedSolution: { type: String },
    alternativeOptions: [{ type: String }],
    estimatedEffort: { type: String },

    // ── CCB Review ──
    ccbReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reviews: [{
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      recommendation: { type: String, enum: ['approve', 'reject', 'defer', 'need-more-info'] },
      comments: { type: String },
      reviewDate: { type: Date, default: Date.now },
    }],

    // ── Decision ──
    decision: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'deferred'],
      default: 'pending',
    },
    decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decisionDate: { type: Date },
    decisionRationale: { type: String },

    implementationPlan: { type: String },
    baselineUpdated: { type: Boolean, default: false },

    attachments: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

ChangeRequestSchema.index({ decision: 1, project: 1 });

// Auto-generate changeRequestId
ChangeRequestSchema.pre('save', async function (next) {
  if (this.isNew && !this.changeRequestId) {
    try {
      const counter = await CRCounter.findByIdAndUpdate(
        `${this.project}_crCounter`,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.changeRequestId = `CR-${String(counter.seq).padStart(3, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('ChangeRequest', ChangeRequestSchema);
