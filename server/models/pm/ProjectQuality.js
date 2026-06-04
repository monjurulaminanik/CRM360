const mongoose = require('mongoose');

const QualityStandardSchema = new mongoose.Schema({
  standard: { type: String, required: true },
  description: { type: String },
  criteria: { type: String },
}, { _id: true });

const QualityMetricSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  target: { type: String },
  actual: { type: String },
  status: { type: String, enum: ['not-measured', 'on-target', 'below-target', 'above-target'], default: 'not-measured' },
}, { _id: true });

const QAActivitySchema = new mongoose.Schema({
  activity: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  frequency: { type: String, enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'per-sprint', 'per-milestone'], default: 'weekly' },
  lastDone: { type: Date },
}, { _id: true });

const QCCheckSchema = new mongoose.Schema({
  check: { type: String, required: true },
  expected: { type: String },
  actual: { type: String },
  status: { type: String, enum: ['pending', 'pass', 'fail', 'na'], default: 'pending' },
  date: { type: Date },
  doneBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const DefectSchema = new mongoose.Schema({
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed', 'wont-fix'], default: 'open' },
  foundDate: { type: Date, default: Date.now },
  resolvedDate: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foundBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const ProjectQualitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    qualityStandards: [QualityStandardSchema],
    qualityMetrics: [QualityMetricSchema],
    qaActivities: [QAActivitySchema],
    qcChecks: [QCCheckSchema],
    defects: [DefectSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProjectQuality', ProjectQualitySchema);
