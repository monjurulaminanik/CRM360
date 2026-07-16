const axios = require('axios');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const FacebookMessage = require('../models/FacebookMessage');
const { getMetaDefaults, normalizePhone, getLeadField } = require('../utils/metaHelpers');
const logger = require('../config/logger');

const GRAPH_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0';
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;

// ── Webhook verify (Meta hub challenge) ──────────────────────────────────────
const webhookVerify = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

// ── Create / update lead from Lead Ads payload ───────────────────────────────
async function upsertLeadFromFacebookLead(leadData, meta = {}) {
  const { tenantId, createdBy } = getMetaDefaults();
  const fieldData = leadData.field_data || [];

  const name =
    getLeadField(fieldData, ['full_name', 'full name', 'name']) ||
    [getLeadField(fieldData, ['first_name']), getLeadField(fieldData, ['last_name'])]
      .filter(Boolean)
      .join(' ') ||
    'Facebook Lead';

  const email = getLeadField(fieldData, ['email', 'e-mail']);
  const phone = normalizePhone(
    getLeadField(fieldData, ['phone_number', 'phone', 'mobile', 'mobile_number'])
  );

  if (leadData.id) {
    const existingByMeta = await Lead.findOne({ metaLeadId: leadData.id });
    if (existingByMeta) return existingByMeta;
  }

  if (phone) {
    const byPhone = await Lead.findOne({ phone: { $regex: phone.slice(-10) } });
    if (byPhone) {
      byPhone.metaLeadId = leadData.id || byPhone.metaLeadId;
      byPhone.source = byPhone.source === 'other' ? 'facebook_ads' : byPhone.source;
      byPhone.metaFormId = meta.formId || byPhone.metaFormId;
      byPhone.metaPageId = meta.pageId || byPhone.metaPageId;
      byPhone.metaAdId = meta.adId || byPhone.metaAdId;
      if (email && !byPhone.email) byPhone.email = email;
      await byPhone.save();
      return byPhone;
    }
  }

  if (email) {
    const byEmail = await Lead.findOne({ email: email.toLowerCase() });
    if (byEmail) {
      byEmail.metaLeadId = leadData.id || byEmail.metaLeadId;
      byEmail.source = 'facebook_ads';
      await byEmail.save();
      return byEmail;
    }
  }

  return Lead.create({
    name,
    email: email || undefined,
    phone: phone || undefined,
    source: 'facebook_ads',
    status: 'new',
    priority: 'high',
    notes: `Synced from Facebook Lead Ads form${meta.formId ? ` (${meta.formId})` : ''}`,
    tags: ['facebook', 'lead-ads'],
    metaLeadId: leadData.id,
    metaFormId: meta.formId,
    metaPageId: meta.pageId,
    metaAdId: meta.adId,
    tenantId,
    createdBy,
  });
}

async function fetchAndSyncLeadgen(leadgenId, meta = {}) {
  if (!PAGE_TOKEN || PAGE_TOKEN.includes('your_')) {
    logger.warn('Facebook Page token missing — cannot fetch leadgen details');
    return null;
  }

  const { data } = await axios.get(`${GRAPH_URL}/${leadgenId}`, {
    params: {
      access_token: PAGE_TOKEN,
      fields: 'id,created_time,ad_id,form_id,field_data',
    },
  });

  return upsertLeadFromFacebookLead(data, {
    formId: data.form_id || meta.formId,
    pageId: meta.pageId,
    adId: data.ad_id || meta.adId,
  });
}

async function upsertLeadFromMessenger(psid, profileName) {
  const { tenantId, createdBy } = getMetaDefaults();

  let lead = await Lead.findOne({ facebookPsid: psid });
  if (lead) return lead;

  lead = await Lead.create({
    name: profileName || `Messenger User ${psid.slice(-6)}`,
    source: 'messenger',
    status: 'new',
    priority: 'medium',
    facebookPsid: psid,
    tags: ['messenger', 'facebook'],
    notes: 'Auto-created from Facebook Messenger',
    tenantId,
    createdBy,
  });

  return lead;
}

async function handleLeadgenChange(value, pageId, io) {
  const leadgenId = value.leadgen_id;
  if (!leadgenId) return;

  try {
    const lead = await fetchAndSyncLeadgen(leadgenId, {
      formId: value.form_id,
      pageId: pageId || value.page_id,
      adId: value.ad_id,
    });
    if (lead && io) io.emit('lead:created', lead);
    logger.info(`Facebook lead synced: ${leadgenId}`);
  } catch (err) {
    logger.error(`Failed to sync Facebook lead ${leadgenId}:`, err.message);
  }
}

async function handleMessengerMessaging(event, pageId, io) {
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  const message = event.message;
  if (!senderId || !message) return;

  const metaMessageId = message.mid;
  if (metaMessageId) {
    const existing = await FacebookMessage.findOne({ metaMessageId });
    if (existing) return;
  }

  const isFromPage = senderId === pageId;
  const conversationId = isFromPage ? recipientId : senderId;
  const direction = isFromPage ? 'outbound' : 'inbound';

  let lead = null;
  if (!isFromPage) {
    lead = await upsertLeadFromMessenger(senderId, null);
  } else {
    lead = await Lead.findOne({ facebookPsid: recipientId });
  }

  const text = message.text || '';
  const attachments = message.attachments || [];

  const doc = await FacebookMessage.create({
    metaMessageId,
    conversationId,
    pageId,
    from: senderId,
    to: recipientId,
    direction,
    channel: 'messenger',
    type: attachments.length ? (attachments[0].type || 'other') : 'text',
    content: {
      text,
      mediaUrl: attachments[0]?.payload?.url,
      attachments,
    },
    status: 'received',
    leadId: lead?._id || null,
    raw: event,
  });

  if (lead) {
    lead.lastContactedAt = new Date();
    await lead.save();
  }

  if (io) io.emit('facebook:message_received', doc);
}

// ── Webhook receiver ─────────────────────────────────────────────────────────
const webhookReceive = async (req, res) => {
  // Always ACK Meta quickly
  res.sendStatus(200);

  try {
    const body = req.body;
    const io = req.app.get('io');

    if (body.object !== 'page' && body.object !== 'instagram') {
      return;
    }

    for (const entry of body.entry || []) {
      const pageId = entry.id;

      // Lead Ads
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          await handleLeadgenChange(change.value || {}, pageId, io);
        }
      }

      // Messenger / Page messages
      for (const event of entry.messaging || []) {
        if (event.message) {
          await handleMessengerMessaging(event, pageId, io);
        }
      }
    }
  } catch (err) {
    logger.error('Meta webhook processing error:', err.message);
  }
};

// ── List Messenger inbox ─────────────────────────────────────────────────────
const getMessengerInbox = async (req, res, next) => {
  try {
    const conversations = await FacebookMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          totalMessages: { $sum: 1 },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $limit: 50 },
    ]);
    res.json({ success: true, count: conversations.length, data: conversations });
  } catch (err) {
    next(err);
  }
};

const getMessengerConversation = async (req, res, next) => {
  try {
    const { psid } = req.params;
    const messages = await FacebookMessage.find({ conversationId: psid })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
};

/**
 * Manual sync: pull recent leadgens for a form (optional helper).
 * GET /api/meta/sync-leads?form_id=xxx
 */
const syncLeadsFromForm = async (req, res, next) => {
  try {
    const formId = req.query.form_id || process.env.FACEBOOK_LEAD_FORM_ID;
    if (!formId) {
      return res.status(400).json({ success: false, message: 'form_id required' });
    }
    if (!PAGE_TOKEN || PAGE_TOKEN.includes('your_')) {
      return res.status(400).json({
        success: false,
        message: 'FACEBOOK_PAGE_ACCESS_TOKEN সেট করুন server/.env এ',
      });
    }

    const { data } = await axios.get(`${GRAPH_URL}/${formId}/leads`, {
      params: {
        access_token: PAGE_TOKEN,
        fields: 'id,created_time,ad_id,form_id,field_data',
        limit: 50,
      },
    });

    const synced = [];
    for (const leadData of data.data || []) {
      const lead = await upsertLeadFromFacebookLead(leadData, {
        formId,
        pageId: process.env.FACEBOOK_PAGE_ID,
        adId: leadData.ad_id,
      });
      synced.push(lead);
    }

    res.json({
      success: true,
      message: `${synced.length}টি Facebook lead CRM-এ সিঙ্ক হয়েছে`,
      count: synced.length,
      data: synced,
    });
  } catch (err) {
    next(err);
  }
};

const getConnectionStatus = (req, res) => {
  const waConfigured =
    !!process.env.WHATSAPP_ACCESS_TOKEN &&
    !String(process.env.WHATSAPP_ACCESS_TOKEN).includes('your_');
  const fbConfigured =
    !!PAGE_TOKEN && !String(PAGE_TOKEN).includes('your_');

  res.json({
    success: true,
    data: {
      whatsapp: {
        configured: waConfigured,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
        webhook: '/api/whatsapp/webhook',
      },
      facebook: {
        configured: fbConfigured,
        pageId: process.env.FACEBOOK_PAGE_ID || null,
        webhook: '/api/meta/webhook',
        leadFormId: process.env.FACEBOOK_LEAD_FORM_ID || null,
      },
    },
  });
};

module.exports = {
  webhookVerify,
  webhookReceive,
  getMessengerInbox,
  getMessengerConversation,
  syncLeadsFromForm,
  getConnectionStatus,
  upsertLeadFromFacebookLead,
  upsertLeadFromMessenger,
};
