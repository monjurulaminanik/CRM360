const mongoose = require('mongoose');

const AvailabilitySlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  hoursAvailable: { type: Number, default: 8 },
}, { _id: false });

const ProjectResourceSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    externalName: { type: String, trim: true }, // For non-system users
    isExternal: { type: Boolean, default: false },

    role: { type: String, trim: true },
    skillsRequired: [{ type: String, trim: true }],

    allocationPercent: { type: Number, default: 100, min: 0, max: 100 },
    startDate: { type: Date },
    endDate: { type: Date },

    hourlyRate: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },

    availability: [AvailabilitySlotSchema],

    // Auto-detected by the system
    conflictingProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

    status: {
      type: String,
      enum: ['allocated', 'released', 'on-leave'],
      default: 'allocated',
    },
  },
  { timestamps: true }
);

ProjectResourceSchema.index({ resource: 1, project: 1 });
ProjectResourceSchema.index({ resource: 1, status: 1 });

// Auto-calculate totalCost
ProjectResourceSchema.pre('save', function (next) {
  if (this.hourlyRate && this.startDate && this.endDate) {
    const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    const effectiveHours = days * 8 * ((this.allocationPercent || 100) / 100);
    this.totalCost = effectiveHours * this.hourlyRate;
  }
  next();
});

module.exports = mongoose.model('ProjectResource', ProjectResourceSchema);
