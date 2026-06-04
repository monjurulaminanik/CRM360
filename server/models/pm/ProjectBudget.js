const mongoose = require('mongoose');

const BudgetCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Labor, Software, Tools, Subcontractor, Travel, Materials, Other
  plannedAmount: { type: Number, default: 0 },
  actualAmount: { type: Number, default: 0 },
}, { _id: true });

BudgetCategorySchema.virtual('variance').get(function () {
  return (this.plannedAmount || 0) - (this.actualAmount || 0);
});

const TAndMEntrySchema = new mongoose.Schema({
  resourceName: { type: String, required: true },
  role: { type: String },
  hourlyRate: { type: Number, default: 0 },
  hoursPlanned: { type: Number, default: 0 },
  hoursActual: { type: Number, default: 0 },
}, { _id: true });

TAndMEntrySchema.virtual('costPlanned').get(function () {
  return (this.hourlyRate || 0) * (this.hoursPlanned || 0);
});
TAndMEntrySchema.virtual('costActual').get(function () {
  return (this.hourlyRate || 0) * (this.hoursActual || 0);
});

const ProjectBudgetSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // ── Budget Totals ──
    totalBudget: { type: Number, default: 0 },
    contingencyReservePercent: { type: Number, default: 10 },
    contingencyReserveAmount: { type: Number, default: 0 },
    managementReservePercent: { type: Number, default: 5 },
    managementReserveAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'BDT' },

    // ── Categories ──
    categories: {
      type: [BudgetCategorySchema],
      default: [
        { name: 'Labor', plannedAmount: 0, actualAmount: 0 },
        { name: 'Software', plannedAmount: 0, actualAmount: 0 },
        { name: 'Tools', plannedAmount: 0, actualAmount: 0 },
        { name: 'Subcontractor', plannedAmount: 0, actualAmount: 0 },
        { name: 'Travel', plannedAmount: 0, actualAmount: 0 },
        { name: 'Materials', plannedAmount: 0, actualAmount: 0 },
        { name: 'Other', plannedAmount: 0, actualAmount: 0 },
      ],
    },

    // ── Time & Materials Tracker ──
    timeAndMaterials: [TAndMEntrySchema],

    // ── Earned Value Management ──
    earnedValueData: {
      plannedValue: { type: Number, default: 0 },       // PV (BCWS)
      earnedValue: { type: Number, default: 0 },         // EV (BCWP)
      actualCost: { type: Number, default: 0 },          // AC (ACWP)
      spi: { type: Number },                             // Schedule Performance Index = EV/PV
      cpi: { type: Number },                             // Cost Performance Index = EV/AC
      sv: { type: Number },                              // Schedule Variance = EV - PV
      cv: { type: Number },                              // Cost Variance = EV - AC
      eac: { type: Number },                             // Estimate at Completion = BAC/CPI
      etc: { type: Number },                             // Estimate to Complete = EAC - AC
      vac: { type: Number },                             // Variance at Completion = BAC - EAC
      bac: { type: Number },                             // Budget at Completion
    },

    // ── Health ──
    budgetHealth: {
      type: String,
      enum: ['green', 'amber', 'red'],
      default: 'green',
    },

    lastReconciled: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: total planned across categories
ProjectBudgetSchema.virtual('totalPlanned').get(function () {
  return (this.categories || []).reduce((sum, c) => sum + (c.plannedAmount || 0), 0);
});

// Virtual: total actual across categories
ProjectBudgetSchema.virtual('totalActual').get(function () {
  return (this.categories || []).reduce((sum, c) => sum + (c.actualAmount || 0), 0);
});

module.exports = mongoose.model('ProjectBudget', ProjectBudgetSchema);
