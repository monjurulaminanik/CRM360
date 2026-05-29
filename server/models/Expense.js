const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: [true, 'Expense title is required'], trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    date: { type: Date, required: true, default: Date.now },
    
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    
    receiptUrl: { type: String },
    notes: { type: String },
    
    // Optional link to project/client
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
