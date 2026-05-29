const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, addPayment } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.post('/:id/payments', addPayment);

module.exports = router;
