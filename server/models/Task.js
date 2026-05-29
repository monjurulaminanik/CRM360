const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: [true, 'Task title is required'], trim: true },
    description: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo',
    },
    dueDate: { type: Date },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Optional links to other entities
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1, assignee: 1, tenantId: 1 });

module.exports = mongoose.model('Task', TaskSchema);
