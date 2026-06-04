const ProjectQuality = require('../../models/pm/ProjectQuality');

// GET /api/pm/projects/:id/quality
const getQuality = async (req, res, next) => {
  try {
    let quality = await ProjectQuality.findOne({ project: req.params.id })
      .populate('qaActivities.owner', 'name avatar')
      .populate('qcChecks.doneBy', 'name avatar')
      .populate('defects.resolvedBy', 'name avatar')
      .populate('defects.foundBy', 'name avatar');
    if (!quality) {
      quality = await ProjectQuality.create({ project: req.params.id, tenantId: req.user.tenantId });
    }
    res.json({ success: true, data: quality });
  } catch (err) { next(err); }
};

// PUT /api/pm/projects/:id/quality
const updateQuality = async (req, res, next) => {
  try {
    const quality = await ProjectQuality.findOneAndUpdate(
      { project: req.params.id },
      req.body,
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: quality });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/quality/checks
const addQCCheck = async (req, res, next) => {
  try {
    const quality = await ProjectQuality.findOne({ project: req.params.id });
    if (!quality) return res.status(404).json({ success: false, message: 'Quality plan not found' });
    quality.qcChecks.push({ ...req.body, doneBy: req.user._id, date: new Date() });
    await quality.save();
    res.json({ success: true, data: quality });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/quality/defects
const addDefect = async (req, res, next) => {
  try {
    const quality = await ProjectQuality.findOne({ project: req.params.id });
    if (!quality) return res.status(404).json({ success: false, message: 'Quality plan not found' });
    quality.defects.push({ ...req.body, foundBy: req.user._id });
    await quality.save();
    res.json({ success: true, data: quality });
  } catch (err) { next(err); }
};

module.exports = { getQuality, updateQuality, addQCCheck, addDefect };
