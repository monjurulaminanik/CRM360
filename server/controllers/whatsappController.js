const axios = require('axios');
const WhatsAppMessage = require('../models/WhatsAppMessage');
const Lead = require('../models/Lead');
const Client = require('../models/Client');

const { dbState } = require('../config/db');

const WA_API_URL = process.env.WHATSAPP_API_URL;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// @desc    Send text message
// @route   POST /api/whatsapp/send
const sendMessage = async (req, res, next) => {
  try {
    const { to, message, leadId, clientId } = req.body;
    let waMsg;

    if (dbState.isOffline || ACCESS_TOKEN === 'your_whatsapp_access_token' || !ACCESS_TOKEN) {
      waMsg = await WhatsAppMessage.create({
        waMessageId: 'offline_' + Math.random().toString(36).substring(2, 12),
        conversationId: to,
        from: PHONE_NUMBER_ID || 'd360_system',
        to,
        direction: 'outbound',
        type: 'text',
        content: { text: message },
        status: 'read',
        sentAt: new Date(),
        deliveredAt: new Date(),
        readAt: new Date(),
        leadId: leadId || null,
        clientId: clientId || null,
        sentBy: req.user._id,
      });

      req.app.get('io').emit('whatsapp:message_sent', waMsg);

      // --- SIMULATE AUTO-REPLY ---
      setTimeout(async () => {
        const replies = [
          "Hey there! Thanks for reaching out. How can I help you?",
          "Awesome! I'm reviewing the proposal details now.",
          "Can we schedule a call for tomorrow morning?",
          "Got your message! Let's get started on the next steps.",
          "Excellent service, thanks for the quick follow-up!",
          "Yes, that looks perfect. Please send over the contract."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const inboundMsg = await WhatsAppMessage.create({
          waMessageId: 'offline_' + Math.random().toString(36).substring(2, 12),
          conversationId: to,
          from: to,
          to: PHONE_NUMBER_ID || 'd360_system',
          direction: 'inbound',
          type: 'text',
          content: { text: randomReply },
          status: 'unread',
          sentAt: new Date(),
          leadId: leadId || null,
          clientId: clientId || null,
        });

        req.app.get('io').emit('whatsapp:message_received', inboundMsg);
      }, 2000);

    } else {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: message },
      };

      const response = await axios.post(
        `${WA_API_URL}/${PHONE_NUMBER_ID}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' } }
      );

      waMsg = await WhatsAppMessage.create({
        waMessageId: response.data.messages[0].id,
        conversationId: to,
        from: PHONE_NUMBER_ID,
        to,
        direction: 'outbound',
        type: 'text',
        content: { text: message },
        status: 'sent',
        sentAt: new Date(),
        leadId: leadId || null,
        clientId: clientId || null,
        sentBy: req.user._id,
      });

      req.app.get('io').emit('whatsapp:message_sent', waMsg);
    }

    res.json({ success: true, data: waMsg });
  } catch (err) {
    next(err);
  }
};

// @desc    Send template message
// @route   POST /api/whatsapp/send-template
const sendTemplate = async (req, res, next) => {
  try {
    const { to, templateName, languageCode = 'en_US', components, leadId, clientId } = req.body;
    let waMsg;

    if (dbState.isOffline || ACCESS_TOKEN === 'your_whatsapp_access_token' || !ACCESS_TOKEN) {
      waMsg = await WhatsAppMessage.create({
        waMessageId: 'offline_' + Math.random().toString(36).substring(2, 12),
        conversationId: to,
        from: PHONE_NUMBER_ID || 'd360_system',
        to,
        direction: 'outbound',
        type: 'template',
        content: { templateName },
        status: 'read',
        sentAt: new Date(),
        isTemplate: true,
        templateName,
        leadId: leadId || null,
        clientId: clientId || null,
        sentBy: req.user._id,
      });

      req.app.get('io').emit('whatsapp:message_sent', waMsg);

      setTimeout(async () => {
        const replyText = `Thanks for sending the template: "${templateName}". Let's connect!`;
        const inboundMsg = await WhatsAppMessage.create({
          waMessageId: 'offline_' + Math.random().toString(36).substring(2, 12),
          conversationId: to,
          from: to,
          to: PHONE_NUMBER_ID || 'd360_system',
          direction: 'inbound',
          type: 'text',
          content: { text: replyText },
          status: 'unread',
          sentAt: new Date(),
          leadId: leadId || null,
          clientId: clientId || null,
        });

        req.app.get('io').emit('whatsapp:message_received', inboundMsg);
      }, 2000);

    } else {
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components || [],
        },
      };

      const response = await axios.post(
        `${WA_API_URL}/${PHONE_NUMBER_ID}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' } }
      );

      waMsg = await WhatsAppMessage.create({
        waMessageId: response.data.messages[0].id,
        conversationId: to,
        from: PHONE_NUMBER_ID,
        to,
        direction: 'outbound',
        type: 'template',
        content: { templateName },
        status: 'sent',
        sentAt: new Date(),
        isTemplate: true,
        templateName,
        leadId: leadId || null,
        clientId: clientId || null,
        sentBy: req.user._id,
      });

      req.app.get('io').emit('whatsapp:message_sent', waMsg);
    }

    res.json({ success: true, data: waMsg });
  } catch (err) {
    next(err);
  }
};

// @desc    Get conversation history
// @route   GET /api/whatsapp/conversation/:phone
const getConversation = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await WhatsAppMessage.find({ conversationId: phone })
      .populate('sentBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: messages.length, data: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all conversations (inbox)
// @route   GET /api/whatsapp/inbox
const getInbox = async (req, res, next) => {
  try {
    const conversations = await WhatsAppMessage.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$direction', 'inbound'] }, { $ne: ['$status', 'read'] }] }, 1, 0],
            },
          },
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

// @desc    Webhook receiver (from Meta)
// @route   POST /api/whatsapp/webhook
const webhookReceive = async (req, res, next) => {
  try {
    const { entry } = req.body;

    if (!entry?.length) return res.sendStatus(200);

    for (const e of entry) {
      for (const change of e.changes) {
        const { messages, statuses } = change.value;

        // Handle incoming messages
        if (messages?.length) {
          for (const msg of messages) {
            const existing = await WhatsAppMessage.findOne({ waMessageId: msg.id });
            if (existing) continue;

            const messageDoc = await WhatsAppMessage.create({
              waMessageId: msg.id,
              conversationId: msg.from,
              from: msg.from,
              to: PHONE_NUMBER_ID,
              direction: 'inbound',
              type: msg.type,
              content: {
                text: msg.text?.body,
                mediaId: msg.image?.id || msg.document?.id || msg.audio?.id || msg.video?.id,
                caption: msg.image?.caption || msg.document?.caption,
                fileName: msg.document?.filename,
                mimeType: msg.image?.mime_type || msg.document?.mime_type,
              },
              status: 'delivered',
            });

            // Auto-link to lead/client by phone
            const phoneNumber = msg.from.replace(/^\+/, '');
            const lead = await Lead.findOne({ phone: { $regex: phoneNumber } });
            const client = await Client.findOne({
              $or: [{ phone: { $regex: phoneNumber } }, { whatsappNumber: { $regex: phoneNumber } }],
            });

            if (lead) messageDoc.leadId = lead._id;
            if (client) messageDoc.clientId = client._id;
            if (lead || client) await messageDoc.save();

            // Emit real-time update
            req.app.get('io').emit('whatsapp:message_received', messageDoc);
          }
        }

        // Handle status updates
        if (statuses?.length) {
          for (const status of statuses) {
            await WhatsAppMessage.findOneAndUpdate(
              { waMessageId: status.id },
              {
                status: status.status,
                ...(status.status === 'delivered' && { deliveredAt: new Date() }),
                ...(status.status === 'read' && { readAt: new Date() }),
              }
            );
            req.app.get('io').emit('whatsapp:status_update', { id: status.id, status: status.status });
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

// @desc    Webhook verification (from Meta)
// @route   GET /api/whatsapp/webhook
const webhookVerify = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

module.exports = { sendMessage, sendTemplate, getConversation, getInbox, webhookReceive, webhookVerify };
