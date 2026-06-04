const mongoose = require('mongoose');

const ProjectVendorSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    vendorName: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },

    service: { type: String, trim: true },
    contractType: {
      type: String,
      enum: ['fixed-price', 't-and-m', 'cost-reimbursable'],
      default: 'fixed-price',
    },
    contractValue: { type: Number, default: 0 },
    paymentTerms: { type: String },

    contractStartDate: { type: Date },
    contractEndDate: { type: Date },

    sla: { type: String },
    deliverables: [{ type: String }],

    performance: {
      rating: { type: Number, min: 1, max: 5 },
      notes: { type: String },
      lastReviewed: { type: Date },
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },

    documents: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

ProjectVendorSchema.index({ status: 1, project: 1 });

module.exports = mongoose.model('ProjectVendor', ProjectVendorSchema);
