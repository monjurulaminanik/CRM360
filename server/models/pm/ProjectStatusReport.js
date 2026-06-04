const mongoose = require('mongoose');

const ProjectStatusReportSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    reportNumber: { type: Number, required: true },
    reportDate: { type: Date, default: Date.now },
    periodStart: { type: Date },
    periodEnd: { type: Date },

    // ── Executive Summary ──
    executiveSummary: { type: String },

    // ── RAG Status ──
    overallRag: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
    scheduleRag: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
    budgetRag: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
    scopeRag: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
    qualityRag: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
    riskRag: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },

    // ── Progress ──
    progressThisPeriod: [{ type: String }],
    planNextPeriod: [{ type: String }],

    // ── Denormalized snapshots ──
    top5Risks: [{
      entryId: String,
      description: String,
      probability: String,
      impactLevel: String,
      riskScore: Number,
      owner: String,
      status: String,
    }],
    openIssues: [{
      entryId: String,
      description: String,
      priority: String,
      owner: String,
      status: String,
    }],
    decisionsNeeded: [{ type: String }],

    // ── Budget Snapshot ──
    budgetSnapshot: {
      plannedToDate: { type: Number },
      actualToDate: { type: Number },
      variance: { type: Number },
      eac: { type: Number },
    },

    // ── Schedule Snapshot ──
    scheduleSnapshot: {
      completedTasks: { type: Number },
      plannedTasks: { type: Number },
      percentComplete: { type: Number },
    },

    // ── Distribution ──
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    distributedTo: [{ type: String }], // emails or user refs
    pdfUrl: { type: String },
    sentViaWhatsApp: { type: Boolean, default: false },
    sentViaEmail: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

ProjectStatusReportSchema.index({ reportNumber: 1, project: 1 });

module.exports = mongoose.model('ProjectStatusReport', ProjectStatusReportSchema);
