const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getClients, getClient, createClient, updateClient, deleteClient, getClientStats,
  getClientNotes, addClientNote, generateMagicLink,
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

const createClientValidation = [
  body('name').notEmpty().withMessage('Client name is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
];

router.get('/stats', getClientStats);
router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', createClientValidation, validate, createClient);
router.put('/:id', updateClient);
router.delete('/:id', authorize('admin'), deleteClient);
router.get('/:id/notes', getClientNotes);
router.post('/:id/notes', addClientNote);
router.post('/:id/magic-link', authorize('admin', 'manager'), generateMagicLink);

module.exports = router;
