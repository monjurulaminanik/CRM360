const mongoose = require('mongoose');

const StakeholderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  organization: { type: String },
  powerLevel: { type: Number, min: 1, max: 5, default: 3 },
  interestLevel: { type: Number, min: 1, max: 5, default: 3 },
  expectations: { type: String },
  communicationPreference: { type: String, enum: ['email', 'whatsapp', 'meeting', 'phone', 'slack'], default: 'email' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const ProjectCharterSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // ── Business Case ──
    businessCase: {
      problem: { type: String },
      proposedSolution: { type: String },
      expectedBenefits: { type: String },
      strategicAlignment: { type: String },
      costEstimate: { type: Number },
      roiEstimate: { type: String },
    },

    // ── Feasibility Study ──
    feasibilityStudy: {
      technical: { type: String },
      financial: { type: String },
      operational: { type: String },
      legal: { type: String },
      timeline: { type: String },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      performedDate: { type: Date },
      conclusion: { type: String, enum: ['feasible', 'not-feasible', 'conditionally-feasible', 'pending'], default: 'pending' },
    },

    // ── Objectives (SMART Goals) ──
    objectives: [{
      description: { type: String, required: true },
      measurable: { type: String },
      targetDate: { type: Date },
      status: { type: String, enum: ['pending', 'achieved', 'missed'], default: 'pending' },
    }],

    // ── Scope ──
    inScope: [{ type: String }],
    outOfScope: [{ type: String }],

    // ── High-Level Milestones ──
    highLevelMilestones: [{
      name: { type: String, required: true },
      targetDate: { type: Date },
    }],

    // ── Budget ──
    highLevelBudget: { type: Number },

    // ── Risks ──
    highLevelRisks: [{
      description: { type: String, required: true },
      impact: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
      mitigation: { type: String },
    }],

    // ── Assumptions & Constraints ──
    assumptions: [{ type: String }],
    constraints: [{ type: String }],

    // ── Stakeholders ──
    stakeholders: [StakeholderSchema],

    // ── Approval ──
    charterStatus: {
      type: String,
      enum: ['draft', 'in-review', 'approved', 'signed', 'rejected'],
      default: 'draft',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedDate: { type: Date },
    rejectionReason: { type: String },
    sponsorSignature: { type: String }, // URL to signature image
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProjectCharter', ProjectCharterSchema);
