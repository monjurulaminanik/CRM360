const ChangeRequest = require('../../models/pm/ChangeRequest');

const getChangeRequests = async (req, res, next) => {
  try {
    const { decision, type } = req.query;
    const query = { project: req.params.id };
    if (decision) query.decision = decision;
    if (type) query.type = type;
    const changes = await ChangeRequest.find(query)
      .populate('requestedBy', 'name avatar')
      .populate('decisionBy', 'name')
      .populate('ccbReviewers', 'name avatar')
      .sort({ requestDate: -1 });
    res.json({ success: true, count: changes.length, data: changes });
  } catch (err) { next(err); }
};

const createChangeRequest = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    req.body.requestedBy = req.user._id;
    const cr = await ChangeRequest.create(req.body);
    await cr.populate('requestedBy', 'name avatar');
    res.status(201).json({ success: true, data: cr });
  } catch (err) { next(err); }
};

const updateChangeRequest = async (req, res, next) => {
  try {
    const cr = await ChangeRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('requestedBy', 'name avatar')
      .populate('ccbReviewers', 'name avatar');
    if (!cr) return res.status(404).json({ success: false, message: 'Change request not found' });
    res.json({ success: true, data: cr });
  } catch (err) { next(err); }
};

const addReview = async (req, res, next) => {
  try {
    const cr = await ChangeRequest.findById(req.params.id);
    if (!cr) return res.status(404).json({ success: false, message: 'Change request not found' });
    cr.reviews.push({ reviewer: req.user._id, ...req.body });
    await cr.save();
    res.json({ success: true, data: cr });
  } catch (err) { next(err); }
};

const makeDecision = async (req, res, next) => {
  try {
    const cr = await ChangeRequest.findById(req.params.id);
    if (!cr) return res.status(404).json({ success: false, message: 'Change request not found' });
    cr.decision = req.body.decision;
    cr.decisionBy = req.user._id;
    cr.decisionDate = new Date();
    cr.decisionRationale = req.body.decisionRationale;
    if (req.body.implementationPlan) cr.implementationPlan = req.body.implementationPlan;
    await cr.save();
    res.json({ success: true, data: cr, message: `Change request ${cr.decision}` });
  } catch (err) { next(err); }
};

module.exports = { getChangeRequests, createChangeRequest, updateChangeRequest, addReview, makeDecision };
