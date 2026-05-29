const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Tenant slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'basic',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'trial'],
      default: 'trial',
    },
    expiresAt: {
      type: Date,
      required: [true, 'Subscription expiry date is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', TenantSchema);
