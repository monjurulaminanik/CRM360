const mongoose = require('mongoose');

const ProjectExpenseSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    category: {
      type: String,
      enum: ['labor', 'software', 'tools', 'subcontractor', 'travel', 'materials', 'other'],
      default: 'other',
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    date: { type: Date, default: Date.now },

    vendor: { type: String, trim: true },
    invoiceNumber: { type: String, trim: true },
    receiptUrl: { type: String },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvalDate: { type: Date },
    rejectionReason: { type: String },

    billable: { type: Boolean, default: true },
    billedToClient: { type: Boolean, default: false },

    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ProjectExpenseSchema.index({ category: 1, project: 1 });
ProjectExpenseSchema.index({ approvalStatus: 1, project: 1 });

module.exports = mongoose.model('ProjectExpense', ProjectExpenseSchema);
