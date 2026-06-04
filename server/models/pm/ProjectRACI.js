const mongoose = require('mongoose');

const RACIEntrySchema = new mongoose.Schema({
  activity: { type: String, required: true },
  responsible: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  accountable: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Only ONE
  consulted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  informed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: true });

const ProjectRACISchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    matrix: [RACIEntrySchema],
  },
  { timestamps: true }
);

// Validation: ensure each entry has exactly one accountable
ProjectRACISchema.pre('save', function (next) {
  for (const entry of this.matrix) {
    if (!entry.accountable) {
      return next(new Error(`RACI activity "${entry.activity}" must have exactly one Accountable person`));
    }
  }
  next();
});

module.exports = mongoose.model('ProjectRACI', ProjectRACISchema);
