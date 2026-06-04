const ProjectDocument = require('../../models/pm/ProjectDocument');

const getDocuments = async (req, res, next) => {
  try {
    const { category, phase } = req.query;
    const query = { project: req.params.id, isLatest: true };
    if (category) query.category = category;
    if (phase) query.relatedPhase = phase;
    const docs = await ProjectDocument.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ uploadedDate: -1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
};

const uploadDocument = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    req.body.uploadedBy = req.user._id;
    const doc = await ProjectDocument.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

module.exports = { getDocuments, uploadDocument };
