const mongoose = require('mongoose');

/**
 * Facebook / Instagram Messenger messages synced into D360 CRM.
 */
const FacebookMessageSchema = new mongoose.Schema(
  {
    metaMessageId: { type: String, unique: true, sparse: true },
    conversationId: { type: String, index: true }, // PSID or thread id
    pageId: { type: String, index: true },

    from: { type: String, required: true }, // PSID or page id
    to: { type: String, required: true },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['messenger', 'instagram', 'facebook_page'],
      default: 'messenger',
    },

    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'file', 'sticker', 'location', 'other'],
      default: 'text',
    },
    content: {
      text: String,
      mediaUrl: String,
      attachments: [mongoose.Schema.Types.Mixed],
    },

    status: {
      type: String,
      enum: ['received', 'sent', 'delivered', 'read', 'failed'],
      default: 'received',
    },

    senderName: { type: String },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

FacebookMessageSchema.index({ conversationId: 1, createdAt: -1 });
FacebookMessageSchema.index({ leadId: 1 });

module.exports = mongoose.model('FacebookMessage', FacebookMessageSchema);
