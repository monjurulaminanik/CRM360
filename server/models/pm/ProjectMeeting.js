const mongoose = require('mongoose');

const ActionItemSchema = new mongoose.Schema({
  action: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  status: { type: String, enum: ['open', 'in-progress', 'completed', 'overdue'], default: 'open' },
}, { _id: true });

const ProjectMeetingSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    type: {
      type: String,
      enum: ['kick-off', 'status', 'steering', 'stand-up', 'retrospective', 'decision', 'ad-hoc'],
      default: 'status',
    },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String }, // "09:00"
    endTime: { type: String },   // "10:00"
    location: { type: String, trim: true },
    meetingLink: { type: String, trim: true },

    agenda: [{ type: String }],

    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attendanceMarked: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    }],

    minutes: { type: String }, // Rich text / markdown
    actionItems: [ActionItemSchema],
    decisionsMade: [{ type: String }],

    nextMeetingDate: { type: Date },
    recordingUrl: { type: String },
    attachments: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ProjectMeetingSchema.index({ date: 1, project: 1 });
ProjectMeetingSchema.index({ type: 1, project: 1 });

module.exports = mongoose.model('ProjectMeeting', ProjectMeetingSchema);
