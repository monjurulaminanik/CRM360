const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentDate: { type: Date, default: Date.now },
    
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'credit_card', 'cash', 'bkash', 'nagad', 'paypal', 'other'],
      default: 'bank_transfer',
    },
    transactionId: { type: String },
    notes: { type: String },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
