const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  lessonId: { type: String },
  category: {
    type: String,
    enum: ['process', 'people', 'tools', 'vendors', 'communication', 'estimation', 'risk', 'quality', 'stakeholder'],
    default: 'process',
  },
  description: { type: String, required: true },
  whatHappened: { type: String },
  rootCause: { type: String },
  impact: { type: String },
  recommendation: { type: String },
  applicableTo: [{ type: String }], // e.g., "All development projects", "SEO projects"
  capturedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const ProjectLessonsLearnedSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    captureDate: { type: Date, default: Date.now },
    sessionAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    whatWentWell: [{ type: String }],
    whatDidntGoWell: [{ type: String }],
    whatToDoDifferently: [{ type: String }],

    lessons: [LessonSchema],

    followUpActions: [{
      action: { type: String },
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      dueDate: { type: Date },
      status: { type: String, enum: ['open', 'completed'], default: 'open' },
    }],

    archived: { type: Boolean, default: false },
    archivedDate: { type: Date },

    // Organization-wide library visibility
    visibleInLibrary: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProjectLessonsLearnedSchema.index({ visibleInLibrary: 1, tenantId: 1 });

module.exports = mongoose.model('ProjectLessonsLearned', ProjectLessonsLearnedSchema);
