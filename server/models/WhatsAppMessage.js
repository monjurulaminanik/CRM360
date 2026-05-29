const mongoose = require('mongoose');

const WhatsAppMessageSchema = new mongoose.Schema(
  {
    // Message Identity
    waMessageId: { type: String, unique: true, sparse: true }, // Meta's message ID
    conversationId: { type: String, index: true }, // Groups messages into conversations

    // Participants
    from: { type: String, required: true }, // Phone number (with country code)
    to: { type: String, required: true },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },

    // Message Content
    type: {
      type: String,
      enum: ['text', 'image', 'document', 'audio', 'video', 'template', 'interactive', 'location'],
      default: 'text',
    },
    content: {
      text: String,
      mediaUrl: String,
      mediaId: String,
      caption: String,
      fileName: String,
      mimeType: String,
      templateName: String,
      templateParams: [String],
    },

    // Delivery Status
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
      default: 'queued',
    },
    errorCode: { type: String },
    errorMessage: { type: String },

    // Timestamps from Meta
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },

    // Links
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for inbound

    // Template tracking
    isTemplate: { type: Boolean, default: false },
    templateName: { type: String },
  },
  { timestamps: true }
);

WhatsAppMessageSchema.index({ from: 1, createdAt: -1 });
WhatsAppMessageSchema.index({ to: 1, createdAt: -1 });
WhatsAppMessageSchema.index({ leadId: 1 });
WhatsAppMessageSchema.index({ clientId: 1 });

module.exports = mongoose.model('WhatsAppMessage', WhatsAppMessageSchema);
