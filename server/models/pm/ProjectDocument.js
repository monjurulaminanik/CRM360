const mongoose = require('mongoose');

const ProjectDocumentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['charter', 'plan', 'report', 'design', 'contract', 'deliverable', 'template', 'other'],
      default: 'other',
    },

    fileUrl: { type: String, required: true },
    fileType: { type: String }, // pdf, docx, xlsx, png, etc.
    fileSize: { type: Number }, // bytes

    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true },
    previousVersion: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectDocument' },

    relatedPhase: {
      type: String,
      enum: ['initiation', 'planning', 'execution', 'monitoring', 'closure', 'all'],
      default: 'all',
    },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedDate: { type: Date, default: Date.now },

    visibility: {
      type: String,
      enum: ['private', 'team', 'client'],
      default: 'team',
    },
  },
  { timestamps: true }
);

ProjectDocumentSchema.index({ category: 1, project: 1 });
ProjectDocumentSchema.index({ isLatest: 1, project: 1 });

module.exports = mongoose.model('ProjectDocument', ProjectDocumentSchema);
