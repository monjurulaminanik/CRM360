const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: [true, 'Client name is required'], trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    company: { type: String, trim: true },
    website: { type: String, trim: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'Bangladesh' },
      postalCode: String,
    },

    // Business Info
    industry: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ['startup', 'sme', 'enterprise', 'individual', 'ngo'],
    },

    // Client Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'churned', 'on_hold'],
      default: 'active',
    },
    tier: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      default: 'standard',
    },

    // Active Services
    activeServices: [
      {
        service: {
          type: String,
          enum: [
            'seo', 'social_media_marketing', 'ppc', 'web_design', 'web_development',
            'content_marketing', 'email_marketing', 'branding', 'video_marketing', 'other',
          ],
        },
        startDate: Date,
        endDate: Date,
        monthlyRetainer: Number,
        currency: { type: String, default: 'BDT' },
      },
    ],

    // Communication Preferences
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'whatsapp'],
      default: 'whatsapp',
    },

    // Notes & Tags
    notes: { type: String },
    tags: [{ type: String, trim: true }],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Assignment
    accountManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Origin
    convertedFromLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },

    // Health & Renewal
    healthScore:  { type: Number, default: 75, min: 0, max: 100 },
    renewalDate:  { type: Date },
    lifetimeValue:{ type: Number, default: 0 },

    // Portal Access
    portalAccess: { type: Boolean, default: false },
    portalEmail:  { type: String, lowercase: true },
    portalMagicToken: { type: String },
  },
  { timestamps: true }
);

ClientSchema.index({ status: 1, accountManager: 1 });
ClientSchema.index({ phone: 1 });
ClientSchema.index({ email: 1 });

module.exports = mongoose.model('Client', ClientSchema);
