const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: true });

const DependencySchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectTask', required: true },
  type: { type: String, enum: ['FS', 'SS', 'FF', 'SF'], default: 'FS' }, // Finish-Start, Start-Start, etc.
  lagDays: { type: Number, default: 0 },
}, { _id: false });

const TimeEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hours: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
  isBillable: { type: Boolean, default: true },
}, { _id: true });

// Counter for task codes
const TaskCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // format: projectId_taskCounter
  seq: { type: Number, default: 0 },
});
const TaskCounter = mongoose.models.TaskCounter || mongoose.model('TaskCounter', TaskCounterSchema);

const ProjectTaskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // ── Identity ──
    taskCode: { type: String, index: true },
    name: { type: String, required: [true, 'Task name is required'], trim: true },
    description: { type: String, trim: true },

    // ── Phase & Work Stream ──
    phase: {
      type: String,
      enum: ['initiation', 'planning', 'execution', 'monitoring', 'closure'],
      default: 'execution',
    },
    workStream: { type: String, trim: true }, // Design, Development, Marketing, etc.

    // ── Hierarchy ──
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectTask' },

    // ── Assignment ──
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── RACI ──
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accountable: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    consulted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    informed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Dates ──
    startDate: { type: Date },
    endDate: { type: Date },
    baselineStart: { type: Date },
    baselineEnd: { type: Date },

    // ── Effort ──
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },

    // ── Progress ──
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'blocked', 'done', 'cancelled'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // ── Dependencies ──
    dependencies: [DependencySchema],

    // ── Flags ──
    isCritical: { type: Boolean, default: false },
    isMilestone: { type: Boolean, default: false },

    // ── Attachments ──
    attachments: [{
      name: { type: String },
      url: { type: String },
      fileType: { type: String },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now },
    }],

    // ── Comments ──
    comments: [CommentSchema],

    // ── Time Tracking ──
    timeEntries: [TimeEntrySchema],

    // ── Labels ──
    tags: [{ type: String, trim: true }],
    labels: [{ type: String, trim: true }],

    // ── Audit ──
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ProjectTaskSchema.index({ status: 1, project: 1 });
ProjectTaskSchema.index({ assignedTo: 1, project: 1 });
ProjectTaskSchema.index({ phase: 1, project: 1 });
ProjectTaskSchema.index({ parentTask: 1 });
ProjectTaskSchema.index({ isCritical: 1, project: 1 });

// Virtual: duration in days
ProjectTaskSchema.virtual('durationDays').get(function () {
  if (!this.startDate || !this.endDate) return null;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Auto-generate taskCode
ProjectTaskSchema.pre('save', async function (next) {
  if (this.isNew && !this.taskCode) {
    try {
      const counter = await TaskCounter.findByIdAndUpdate(
        `${this.project}_taskCounter`,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.taskCode = `T-${String(counter.seq).padStart(3, '0')}`;
    } catch (err) {
      return next(err);
    }
  }

  // Auto-calculate actualHours from timeEntries
  if (this.timeEntries && this.timeEntries.length > 0) {
    this.actualHours = this.timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
  }

  // Auto-set progress to 100 if done
  if (this.status === 'done') this.progressPercent = 100;

  next();
});

module.exports = mongoose.model('ProjectTask', ProjectTaskSchema);
