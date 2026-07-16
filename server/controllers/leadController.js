const Lead = require('../models/Lead');
const Client = require('../models/Client');
const LeadNote = require('../models/LeadNote');

// @desc    Get all leads
// @route   GET /api/leads
const getLeads = async (req, res, next) => {
  try {
    const { status, source, priority, assignedTo, search, page = 1, limit = 20 } = req.query;

    const query = { tenantId: req.user.tenantId };
    if (status) query.status = status;
    if (source) query.source = source;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: leads.length,
      total,
      pages: Math.ceil(total / limit),
      data: leads,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name')
      .populate('clientId', 'name email');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// @desc    Create lead
// @route   POST /api/leads
const createLead = async (req, res, next) => {
  try {
    if (!req.user.tenantId) {
      return res.status(400).json({
        success: false,
        message: 'No tenant linked to your account. Run: node scripts/seedAdmin.js',
      });
    }
    req.body.createdBy = req.user._id;
    req.body.tenantId = req.user.tenantId;
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email avatar');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Convert lead to client
// @route   POST /api/leads/:id/convert
const convertToClient = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (lead.convertedToClient) {
      return res.status(400).json({ success: false, message: 'Lead already converted' });
    }

    const client = await Client.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      whatsappNumber: lead.phone,
      company: lead.company,
      website: lead.website,
      notes: lead.notes,
      tags: lead.tags,
      accountManager: lead.assignedTo,
      createdBy: req.user._id,
      tenantId: req.user.tenantId,
      convertedFromLead: lead._id,
      ...req.body, // Allow overrides
    });

    lead.convertedToClient = true;
    lead.convertedAt = Date.now();
    lead.status = 'won';
    lead.clientId = client._id;
    await lead.save();

    res.status(201).json({ success: true, data: client, message: 'Lead converted to client' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get lead pipeline stats
// @route   GET /api/leads/stats
const getLeadStats = async (req, res, next) => {
  try {
    const stats = await Lead.aggregate([
      { $match: { tenantId: req.user.tenantId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const sourceStats = await Lead.aggregate([
      { $match: { tenantId: req.user.tenantId } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: { pipeline: stats, sources: sourceStats } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get notes/activity for a lead
// @route   GET /api/leads/:id/notes
const getLeadNotes = async (req, res, next) => {
  try {
    const notes = await LeadNote.find({ leadId: req.params.id, tenantId: req.user.tenantId })
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: 1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a note/activity to a lead
// @route   POST /api/leads/:id/notes
const addLeadNote = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const note = await LeadNote.create({
      leadId: req.params.id,
      type:     req.body.type || 'note',
      text:     req.body.text,
      metadata: req.body.metadata || {},
      createdBy: req.user._id,
      tenantId: req.user.tenantId,
    });

    await note.populate('createdBy', 'name avatar');

    // Update lastContactedAt for call/email/whatsapp/meeting types
    if (['call', 'email', 'whatsapp', 'meeting'].includes(note.type)) {
      await Lead.findByIdAndUpdate(req.params.id, { lastContactedAt: new Date() });
    }

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead, convertToClient, getLeadStats, getLeadNotes, addLeadNote };
