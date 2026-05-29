const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    name:     { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['facebook_ads', 'google_ads', 'seo', 'email_marketing', 'social_media', 'whatsapp', 'content_marketing', 'web', 'other'],
      default: 'other',
    },
    status:   { type: String, enum: ['active', 'paused', 'completed', 'draft'], default: 'draft' },
    platform: { type: String, trim: true },
    budget: {
      total:    { type: Number, default: 0 },
      spent:    { type: Number, default: 0 },
      currency: { type: String, default: 'PKR' },
    },
    metrics: {
      reach:       { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      clicks:      { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      spend:       { type: Number, default: 0 },
      revenue:     { type: Number, default: 0 },
      roas:        { type: Number, default: 0 },
      ctr:         { type: Number, default: 0 },
      cpc:         { type: Number, default: 0 },
    },
    startDate: { type: Date },
    endDate:   { type: Date },
    notes:     { type: String },
    tags:      [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', CampaignSchema);
