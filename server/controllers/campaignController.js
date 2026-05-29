const Campaign = require('../models/Campaign');

const getCampaigns = async (req, res, next) => {
  try {
    const { clientId, status, type, page = 1, limit = 50 } = req.query;
    const query = {};
    if (clientId) query.clientId = clientId;
    if (status)   query.status = status;
    if (type)     query.type = type;

    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, count: campaigns.length, data: campaigns });
  } catch (err) { next(err); }
};

const getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name');
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
};

const createCampaign = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) { next(err); }
};

const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
};

const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) { next(err); }
};

module.exports = { getCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign };
