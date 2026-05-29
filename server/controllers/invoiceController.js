const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const getInvoices = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = { tenantId: req.user.tenantId };
    
    if (status) query.status = status;
    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const invoices = await Invoice.find(query)
      .populate('clientId', 'name email company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) { next(err); }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
      .populate('clientId', 'name email address phone')
      .populate('createdBy', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    const payments = await Payment.find({ invoiceId: invoice._id });
    
    res.json({ success: true, data: { ...invoice._doc, payments } });
  } catch (err) { next(err); }
};

const createInvoice = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.tenantId = req.user.tenantId;
    
    // Auto generate invoice number if not provided
    if (!req.body.invoiceNumber) {
      const count = await Invoice.countDocuments({ tenantId: req.user.tenantId });
      req.body.invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    
    const invoice = await Invoice.create(req.body);
    await invoice.populate('clientId', 'name');
    res.status(201).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true, runValidators: true }
    ).populate('clientId', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    // Also delete associated payments
    await Payment.deleteMany({ invoiceId: req.params.id });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

const addPayment = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    const payment = await Payment.create({
      ...req.body,
      invoiceId: invoice._id,
      tenantId: req.user.tenantId,
      createdBy: req.user._id
    });
    
    // Optionally update invoice status based on payment amount vs invoice amount
    // Simplistic version: just set to paid if payment amount matches
    if (payment.amount >= invoice.amount) {
      invoice.status = 'paid';
      await invoice.save();
    }
    
    res.status(201).json({ success: true, data: payment });
  } catch (err) { next(err); }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, addPayment };
