const mongoose = require('mongoose');

const ClientNoteSchema = new mongoose.Schema(
  {
    tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    clientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    type:      { type: String, enum: ['note', 'call', 'email', 'meeting', 'whatsapp', 'status_change', 'other'], default: 'note' },
    text:      { type: String, required: true },
    metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClientNote', ClientNoteSchema);
