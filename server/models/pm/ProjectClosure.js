const mongoose = require('mongoose');

const ProjectClosureSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    closureType: {
      type: String,
      enum: ['successful', 'early-termination', 'cancelled'],
      default: 'successful',
    },

    // ── Deliverable Confirmation ──
    deliverableConfirmation: {
      allDelivered: { type: Boolean, default: false },
      pendingItems: [{ type: String }],
    },

    // ── Sign-Off ──
    signOff: {
      sponsorSigned: { type: Boolean, default: false },
      sponsorSignDate: { type: Date },
      clientSigned: { type: Boolean, default: false },
      clientSignDate: { type: Date },
      signatures: [{
        role: String,
        name: String,
        signatureUrl: String,
        signDate: { type: Date },
      }],
    },

    // ── Handover ──
    handoverDetails: {
      handoverDate: { type: Date },
      handoverDocuments: [{ type: String }],
      trainingProvided: { type: Boolean, default: false },
      trainingDetails: { type: String },
      supportArrangement: { type: String },
    },

    // ── Procurement Closure ──
    procurementClosure: {
      vendorContractsClosed: { type: Boolean, default: false },
      finalPaymentsProcessed: { type: Boolean, default: false },
      notes: { type: String },
    },

    // ── Financial Closure ──
    financialClosure: {
      finalBudget: { type: Number },
      finalSpent: { type: Number },
      variance: { type: Number },
      refundDue: { type: Number, default: 0 },
      notes: { type: String },
    },

    // ── Resource Release ──
    resourceRelease: {
      releaseDate: { type: Date },
      teamMemberFeedback: [{ type: String }],
    },

    // ── Lessons & Archive ──
    lessonsLearned: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectLessonsLearned' },
    archiveLocation: { type: String },

    celebrationCompleted: { type: Boolean, default: false },
    finalReportUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProjectClosure', ProjectClosureSchema);
