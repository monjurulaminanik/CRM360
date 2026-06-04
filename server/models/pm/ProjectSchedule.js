const mongoose = require('mongoose');

const WorkStreamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#2D55FF' },
  description: { type: String },
}, { _id: true });

const ScheduleMilestoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetDate: { type: Date },
  status: { type: String, enum: ['pending', 'on-track', 'at-risk', 'missed', 'achieved'], default: 'pending' },
  paymentTrigger: { type: Boolean, default: false },
  paymentPercent: { type: Number },
}, { _id: true });

const ProjectScheduleSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // ── Work Streams ──
    workStreams: [WorkStreamSchema],

    // ── Milestones ──
    milestones: [ScheduleMilestoneSchema],

    // ── Critical Path ──
    criticalPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectTask' }],

    // ── Baseline ──
    baselineStart: { type: Date },
    baselineEnd: { type: Date },
    baselineLocked: { type: Boolean, default: false },
    baselineLockedAt: { type: Date },
    baselineLockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ── Health ──
    scheduleHealth: {
      spi: { type: Number }, // Schedule Performance Index
      variance: { type: Number }, // in days
      status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProjectSchedule', ProjectScheduleSchema);
