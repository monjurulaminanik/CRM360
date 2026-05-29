const Client = require('../models/Client');
const ClientNote = require('../models/ClientNote');

// @desc    Get all clients
// @route   GET /api/clients
const getClients = async (req, res, next) => {
  try {
    const { status, tier, accountManager, search, page = 1, limit = 20 } = req.query;

    const query = { tenantId: req.user.tenantId };
    if (status) query.status = status;
    if (tier) query.tier = tier;
    if (accountManager) query.accountManager = accountManager;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .populate('accountManager', 'name email avatar')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: clients.length, total, pages: Math.ceil(total / limit), data: clients });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
const getClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
      .populate('accountManager', 'name email avatar')
      .populate('createdBy', 'name')
      .populate('convertedFromLead', 'name source');

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Create client
// @route   POST /api/clients
const createClient = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.tenantId = req.user.tenantId;
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      {
      new: true,
      runValidators: true,
    }).populate('accountManager', 'name email avatar');

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get client stats
// @route   GET /api/clients/stats
const getClientStats = async (req, res, next) => {
  try {
    const stats = await Client.aggregate([
      { $match: { tenantId: req.user.tenantId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const tierStats = await Client.aggregate([
      { $match: { tenantId: req.user.tenantId } },
      { $group: { _id: '$tier', count: { $sum: 1 } } },
    ]);
    const totalRevenue = await Client.aggregate([
      { $match: { tenantId: req.user.tenantId } },
      { $unwind: '$activeServices' },
      { $group: { _id: null, total: { $sum: '$activeServices.monthlyRetainer' } } },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byTier: tierStats,
        monthlyRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getClientNotes = async (req, res, next) => {
  try {
    const notes = await ClientNote.find({ clientId: req.params.id, tenantId: req.user.tenantId })
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: 1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) { next(err); }
};

const addClientNote = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const note = await ClientNote.create({
      clientId:  req.params.id,
      type:      req.body.type || 'note',
      text:      req.body.text,
      metadata:  req.body.metadata || {},
      createdBy: req.user._id,
      tenantId:  req.user.tenantId,
    });
    await note.populate('createdBy', 'name avatar');
    res.status(201).json({ success: true, data: note });
  } catch (err) { next(err); }
};

const generateMagicLink = async (req, res, next) => {
  try {
    const token = require('crypto').randomBytes(32).toString('hex');
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { portalAccess: true, portalMagicToken: token },
      { new: true }
    );
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    const link = `${process.env.CLIENT_URL}/portal?token=${token}`;
    res.json({ success: true, data: { link, token } });
  } catch (err) { next(err); }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient, getClientStats, getClientNotes, addClientNote, generateMagicLink };
