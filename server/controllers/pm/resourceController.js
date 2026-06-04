const ProjectResource = require('../../models/pm/ProjectResource');
const ProjectRACI = require('../../models/pm/ProjectRACI');
const { detectResourceConflicts } = require('../../utils/pm/detectResourceConflicts');

// GET /api/pm/projects/:id/resources
const getResources = async (req, res, next) => {
  try {
    const resources = await ProjectResource.find({ project: req.params.id })
      .populate('resource', 'name email avatar role')
      .populate('conflictingProjects', 'name projectCode');
    res.json({ success: true, data: resources });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/resources
const addResource = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;

    // Check conflicts
    if (req.body.resource) {
      const conflicts = await detectResourceConflicts(
        req.body.resource, req.user.tenantId,
        req.body.startDate, req.body.endDate, req.params.id
      );
      if (conflicts.hasConflict) {
        req.body.conflictingProjects = conflicts.projects.map(p => p.projectId);
      }
    }

    const resource = await ProjectResource.create(req.body);
    await resource.populate('resource', 'name email avatar');
    res.status(201).json({ success: true, data: resource, conflicts: req.body.conflictingProjects?.length > 0 });
  } catch (err) { next(err); }
};

// PUT /api/pm/resources/:id
const updateResource = async (req, res, next) => {
  try {
    const resource = await ProjectResource.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('resource', 'name email avatar');
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (err) { next(err); }
};

// GET /api/pm/resources/availability
const getAvailability = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const conflicts = await detectResourceConflicts(
      userId || req.user._id, req.user.tenantId
    );
    res.json({ success: true, data: conflicts });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id/raci
const getRACI = async (req, res, next) => {
  try {
    let raci = await ProjectRACI.findOne({ project: req.params.id })
      .populate('matrix.responsible', 'name avatar')
      .populate('matrix.accountable', 'name avatar')
      .populate('matrix.consulted', 'name avatar')
      .populate('matrix.informed', 'name avatar');
    if (!raci) {
      raci = await ProjectRACI.create({ project: req.params.id, tenantId: req.user.tenantId, matrix: [] });
    }
    res.json({ success: true, data: raci });
  } catch (err) { next(err); }
};

// PUT /api/pm/projects/:id/raci
const updateRACI = async (req, res, next) => {
  try {
    const raci = await ProjectRACI.findOneAndUpdate(
      { project: req.params.id },
      { matrix: req.body.matrix },
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate('matrix.responsible', 'name avatar')
      .populate('matrix.accountable', 'name avatar');
    res.json({ success: true, data: raci });
  } catch (err) { next(err); }
};

module.exports = { getResources, addResource, updateResource, getAvailability, getRACI, updateRACI };
