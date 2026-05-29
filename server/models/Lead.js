const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: [true, 'Lead name is required'], trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    website: { type: String, trim: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // Lead Classification
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    source: {
      type: String,
      enum: ['website', 'whatsapp', 'referral', 'social_media', 'cold_call', 'email', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // Service Interest
    interestedServices: [
      {
        type: String,
        enum: [
          'seo', 'social_media_marketing', 'ppc', 'web_design', 'web_development',
          'content_marketing', 'email_marketing', 'branding', 'video_marketing', 'other',
        ],
      },
    ],
    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'BDT' },
    },

    // Notes & Tags
    notes: { type: String },
    tags: [{ type: String, trim: true }],

    // Assignment
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Conversion
    convertedToClient: { type: Boolean, default: false },
    convertedAt: { type: Date },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },

    // Follow-up
    nextFollowUp: { type: Date },
    lastContactedAt: { type: Date },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, assignedTo: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ email: 1 });

module.exports = mongoose.model('Lead', LeadSchema);
