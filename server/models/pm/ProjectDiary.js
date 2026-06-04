const mongoose = require('mongoose');

const ProjectDiarySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    date: { type: Date, required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    daySummary: { type: String },
    keyMeetings: [{ type: String }],
    decisionsMade: [{ type: String }],
    issuesRaised: [{ type: String }],
    risksSpotted: [{ type: String }],
    actionItems: [{ type: String }],

    stakeholderSentiment: {
      type: String,
      enum: ['good', 'neutral', 'concerned'],
      default: 'neutral',
    },

    tomorrowPriority: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Ensure one diary entry per project per date per author
ProjectDiarySchema.index({ project: 1, date: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('ProjectDiary', ProjectDiarySchema);
