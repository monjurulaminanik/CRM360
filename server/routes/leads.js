const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getLeads, getLead, createLead, updateLead, deleteLead, convertToClient, getLeadStats,
  getLeadNotes, addLeadNote,
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');
const ensureUserTenant = require('../middleware/ensureTenant');
const validate = require('../middleware/validate');

router.use(protect);
router.use(ensureUserTenant);

const createLeadValidation = [
  body('name').notEmpty().withMessage('Lead name is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional({ checkFalsy: true }).isString().withMessage('Valid phone required'),
];

router.get('/stats', getLeadStats);
router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', createLeadValidation, validate, createLead);
router.put('/:id', updateLead);
router.delete('/:id', authorize('admin', 'manager'), deleteLead);
router.post('/:id/convert', authorize('admin', 'manager'), convertToClient);
router.get('/:id/notes', getLeadNotes);
router.post('/:id/notes', addLeadNote);

module.exports = router;
