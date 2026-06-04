const mongoose = require('mongoose');

const ProjectMilestoneSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    targetDate: { type: Date },
    actualDate: { type: Date },

    status: {
      type: String,
      enum: ['pending', 'on-track', 'at-risk', 'missed', 'achieved'],
      default: 'pending',
    },

    relatedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectTask' }],

    // ── Payment Trigger ──
    paymentTrigger: { type: Boolean, default: false },
    paymentPercent: { type: Number }, // % of total contract
    paymentAmount: { type: Number },
    billedAt: { type: Date },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },

    // ── Deliverables ──
    deliverables: [{
      name: { type: String, required: true },
      status: { type: String, enum: ['pending', 'delivered', 'accepted', 'rejected'], default: 'pending' },
      deliveredAt: { type: Date },
    }],

    // ── Approval ──
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedDate: { type: Date },

    celebrationDone: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ProjectMilestoneSchema.index({ status: 1, project: 1 });
ProjectMilestoneSchema.index({ targetDate: 1 });

module.exports = mongoose.model('ProjectMilestone', ProjectMilestoneSchema);
