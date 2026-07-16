const express = require('express');
const router = express.Router();
const {
  webhookVerify,
  webhookReceive,
  getMessengerInbox,
  getMessengerConversation,
  syncLeadsFromForm,
  getConnectionStatus,
} = require('../controllers/metaController');
const { protect } = require('../middleware/auth');

// Meta webhooks (no auth)
router.get('/webhook', webhookVerify);
router.post('/webhook', webhookReceive);

// Protected CRM routes
router.use(protect);
router.get('/status', getConnectionStatus);
router.get('/messenger/inbox', getMessengerInbox);
router.get('/messenger/conversation/:psid', getMessengerConversation);
router.get('/sync-leads', syncLeadsFromForm);

module.exports = router;
