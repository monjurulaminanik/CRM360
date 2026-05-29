const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    month: {
      type: Number,
      required: [true, 'Payroll month is required (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Payroll year is required'],
    },
    workingDays: {
      type: Number,
      required: true,
    },
    presentDays: {
      type: Number,
      required: true,
      default: 0,
    },
    absentDays: {
      type: Number,
      required: true,
      default: 0,
    },
    leaveDays: {
      type: Number,
      required: true,
      default: 0,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    totalAllowances: {
      type: Number,
      required: true,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      required: true,
      default: 0,
    },
    overtime: {
      type: Number,
      required: true,
      default: 0,
    },
    bonus: {
      type: Number,
      required: true,
      default: 0,
    },
    taxDeducted: {
      type: Number,
      required: true,
      default: 0,
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'processed', 'paid'],
      default: 'draft',
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String, // bank_transfer, bkash, nagad, rocket, cash
    },
    transactionRef: {
      type: String,
    },
    payslipUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound unique index
PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
