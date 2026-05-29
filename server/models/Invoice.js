const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['USD', 'BDT', 'EUR'], default: 'USD' },
    
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'cancelled'],
      default: 'pending',
    },
    
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true },
      }
    ],
    
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

InvoiceSchema.index({ clientId: 1, status: 1, tenantId: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
