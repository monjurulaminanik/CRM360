const mongoose = require('mongoose');

const TimeLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    
    totalHours: { type: Number },
    
    description: { type: String },
    isBillable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimeLog', TimeLogSchema);
