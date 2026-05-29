const mongoose = require('mongoose');

const AppraisalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    reviewPeriodStart: {
      type: Date,
      required: true,
    },
    reviewPeriodEnd: {
      type: Date,
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    kpis: [
      {
        title: { type: String, required: true },
        target: { type: String, required: true },
        achieved: { type: String },
        weight: { type: Number, default: 1 }, // default weight
        score: { type: Number, min: 1, max: 5, default: 3 }, // 1 to 5 scale
      },
    ],
    selfRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    strengths: {
      type: String,
    },
    areasOfImprovement: {
      type: String,
    },
    goals: {
      type: String,
    },
    comments: {
      type: String,
    },
    employeeAcknowledgement: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for overallScore based on KPI weighted score
AppraisalSchema.virtual('overallScore').get(function () {
  if (this.kpis && this.kpis.length > 0) {
    let totalScoreWeight = 0;
    let totalWeight = 0;
    this.kpis.forEach((kpi) => {
      totalScoreWeight += kpi.score * (kpi.weight || 1);
      totalWeight += (kpi.weight || 1);
    });
    return Number((totalScoreWeight / totalWeight).toFixed(2));
  }
  return 0;
});

module.exports = mongoose.model('Appraisal', AppraisalSchema);
