const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  sendMessage, sendTemplate, getConversation, getInbox, webhookReceive, webhookVerify,
} = require('../controllers/whatsappController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Webhook endpoints (no auth — called by Meta)
router.get('/webhook', webhookVerify);
router.post('/webhook', webhookReceive);

// Protected routes
router.use(protect);

router.get('/inbox', getInbox);
router.get('/conversation/:phone', getConversation);

router.post(
  '/send',
  [
    body('to').notEmpty().withMessage('Recipient number required'),
    body('message').notEmpty().withMessage('Message content required'),
  ],
  validate,
  sendMessage
);

router.post(
  '/send-template',
  [
    body('to').notEmpty().withMessage('Recipient number required'),
    body('templateName').notEmpty().withMessage('Template name required'),
  ],
  validate,
  sendTemplate
);

module.exports = router;
