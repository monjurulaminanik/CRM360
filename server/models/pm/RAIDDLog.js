const mongoose = require('mongoose');

// Counter for RAIDD entry IDs
const RAIDDCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const RAIDDCounter = mongoose.models.RAIDDCounter || mongoose.model('RAIDDCounter', RAIDDCounterSchema);

const RAIDDEntrySchema = new mongoose.Schema({
  entryId: { type: String },
  type: {
    type: String,
    enum: ['risk', 'action', 'issue', 'decision', 'dependency'],
    required: true,
  },
  description: { type: String, required: true },
  category: { type: String, trim: true },

  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  raisedDate: { type: Date, default: Date.now },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetDate: { type: Date },
  actualResolutionDate: { type: Date },

  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed', 'escalated', 'deferred'], default: 'open' },

  impact: { type: String },
  mitigation: { type: String },
  resolution: { type: String },

  relatedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectTask' }],
  notes: { type: String },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],

  // ── Risk-specific ──
  probability: { type: String, enum: ['very-low', 'low', 'medium', 'high', 'very-high'] },
  impactLevel: { type: String, enum: ['very-low', 'low', 'medium', 'high', 'very-high'] },
  riskScore: { type: Number }, // probability × impact (calculated)
  responseStrategy: { type: String, enum: ['avoid', 'mitigate', 'transfer', 'accept', 'escalate'] },

  // ── Action-specific ──
  dueDate: { type: Date },

  // ── Issue-specific ──
  rootCause: { type: String },
  escalationLevel: { type: Number, default: 0 },

  // ── Decision-specific ──
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rationale: { type: String },
  affectedAreas: [{ type: String }],

  // ── Dependency-specific ──
  predecessor: { type: String },
  successor: { type: String },
  dependencyType: { type: String, enum: ['internal', 'external', 'regulatory'], default: 'internal' },
}, { _id: true, timestamps: true });

const RAIDDLogSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    entries: [RAIDDEntrySchema],
  },
  { timestamps: true }
);

// Auto-generate entryId for new entries
RAIDDLogSchema.pre('save', async function (next) {
  for (const entry of this.entries) {
    if (!entry.entryId) {
      try {
        const counter = await RAIDDCounter.findByIdAndUpdate(
          `${this.project}_raiddCounter`,
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        entry.entryId = `RAIDD-${String(counter.seq).padStart(3, '0')}`;
      } catch (err) {
        return next(err);
      }
    }

    // Auto-calculate risk score
    if (entry.type === 'risk' && entry.probability && entry.impactLevel) {
      const probMap = { 'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very-high': 5 };
      const impMap = { 'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very-high': 5 };
      entry.riskScore = (probMap[entry.probability] || 3) * (impMap[entry.impactLevel] || 3);
    }
  }
  next();
});

module.exports = mongoose.model('RAIDDLog', RAIDDLogSchema);
