const mongoose = require('mongoose');

const SalaryStructureSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      unique: true,
    },
    effectiveFrom: {
      type: Date,
      required: [true, 'Effective date is required'],
    },
    basicSalary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: 0,
    },
    allowances: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['fixed', 'percentage'], required: true },
        value: { type: Number, required: true, min: 0 },
      },
    ],
    deductions: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['fixed', 'percentage'], required: true },
        value: { type: Number, required: true, min: 0 },
      },
    ],
    currency: {
      type: String,
      default: 'BDT',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for grossSalary
SalaryStructureSchema.virtual('grossSalary').get(function () {
  let totalAllowances = 0;
  if (this.allowances && this.allowances.length > 0) {
    this.allowances.forEach((al) => {
      if (al.type === 'fixed') {
        totalAllowances += al.value;
      } else if (al.type === 'percentage') {
        totalAllowances += (al.value / 100) * this.basicSalary;
      }
    });
  }
  return this.basicSalary + totalAllowances;
});

module.exports = mongoose.model('SalaryStructure', SalaryStructureSchema);
