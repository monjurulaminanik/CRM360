const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: [true, 'Project name is required'], trim: true },
    description: { type: String, trim: true },
    
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'not_started',
    },
    
    startDate: { type: Date },
    deadline: { type: Date },
    
    budget: { type: Number },
    currency: { type: String, default: 'BDT' },
    
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    deliverables: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ],
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
