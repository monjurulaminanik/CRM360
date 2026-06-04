const mongoose = require('mongoose');

// Counter schema for auto-incrementing project codes
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const TeamMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, trim: true, default: 'member' }, // designer, developer, marketer, tester, content-writer, etc.
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const ProjectSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // ── Identity ──
    projectCode: { type: String, unique: true, index: true },
    name: { type: String, required: [true, 'Project name is required'], trim: true },
    description: { type: String, trim: true },
    slug: { type: String, trim: true, lowercase: true },

    // ── Client & Type ──
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    projectType: {
      type: String,
      enum: ['marketing', 'development', 'branding', 'seo', 'ads', 'content', 'hybrid', 'web-design', 'mobile-app', 'whatsapp-automation'],
      default: 'development',
    },
    industry: { type: String, trim: true }, // F&B, Real Estate, eCommerce, etc.

    // ── Phase & Status ──
    currentPhase: {
      type: String,
      enum: ['initiation', 'planning', 'execution', 'monitoring', 'closure', 'cancelled', 'on-hold'],
      default: 'initiation',
    },
    overallStatus: {
      type: String,
      enum: ['not-started', 'in-progress', 'at-risk', 'delayed', 'completed', 'cancelled'],
      default: 'not-started',
    },
    ragStatus: {
      type: String,
      enum: ['green', 'amber', 'red'],
      default: 'green',
    },
    ragStatusReasons: {
      schedule: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
      budget: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
      scope: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
      quality: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
      risk: { status: { type: String, enum: ['green', 'amber', 'red'], default: 'green' }, reason: String },
    },

    // ── Timeline ──
    startDate: { type: Date },
    targetEndDate: { type: Date },
    actualEndDate: { type: Date },
    estimatedDurationDays: { type: Number },
    actualDurationDays: { type: Number },

    // ── Budget ──
    estimatedBudget: { type: Number, default: 0 },
    actualSpent: { type: Number, default: 0 },
    currency: { type: String, default: 'BDT' },
    billingType: {
      type: String,
      enum: ['fixed-price', 'time-materials', 'retainer', 'milestone-based'],
      default: 'fixed-price',
    },

    // ── Priority ──
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // ── Team ──
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teamMembers: [TeamMemberSchema],
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ── Visibility & Metadata ──
    visibility: {
      type: String,
      enum: ['private', 'team', 'client-portal'],
      default: 'team',
    },
    tags: [{ type: String, trim: true }],

    // ── Linked Entities ──
    linkedDeals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
    linkedContracts: [{ type: String }], // URLs or IDs
    linkedInvoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],

    // ── Progress ──
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },

    // ── Template ──
    isTemplate: { type: Boolean, default: false },
    templateName: { type: String, trim: true },
    templateCategory: { type: String, trim: true },
    clonedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

    // ── Soft Delete ──
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // ── Audit ──
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ProjectSchema.index({ currentPhase: 1, tenantId: 1 });
ProjectSchema.index({ overallStatus: 1, tenantId: 1 });
ProjectSchema.index({ ragStatus: 1, tenantId: 1 });
ProjectSchema.index({ client: 1, tenantId: 1 });
ProjectSchema.index({ projectManager: 1, tenantId: 1 });
ProjectSchema.index({ isTemplate: 1, tenantId: 1 });
ProjectSchema.index({ isDeleted: 1 });

// Auto-generate slug from name
ProjectSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Auto-generate projectCode
ProjectSchema.pre('save', async function (next) {
  if (this.isNew && !this.projectCode) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'projectCode',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.projectCode = `DIT-PRJ-${String(counter.seq).padStart(3, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Auto-calculate estimated duration
ProjectSchema.pre('save', function (next) {
  if (this.startDate && this.targetEndDate) {
    const diffMs = this.targetEndDate - this.startDate;
    this.estimatedDurationDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
  if (this.startDate && this.actualEndDate) {
    const diffMs = this.actualEndDate - this.startDate;
    this.actualDurationDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
  next();
});

// Virtual: days remaining
ProjectSchema.virtual('daysRemaining').get(function () {
  if (!this.targetEndDate) return null;
  const diffMs = this.targetEndDate - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

// Virtual: budget variance
ProjectSchema.virtual('budgetVariance').get(function () {
  return (this.estimatedBudget || 0) - (this.actualSpent || 0);
});

// Virtual: is overdue
ProjectSchema.virtual('isOverdue').get(function () {
  if (!this.targetEndDate || this.overallStatus === 'completed' || this.overallStatus === 'cancelled') return false;
  return new Date() > this.targetEndDate;
});

// Backward compatibility: clientId alias
ProjectSchema.virtual('clientId').get(function () {
  return this.client;
});

module.exports = mongoose.model('Project', ProjectSchema);
