const Project = require('../models/Project');
const TimeLog = require('../models/TimeLog');

const getProjects = async (req, res, next) => {
  try {
    const { status, clientId, search, page = 1, limit = 50 } = req.query;
    const query = { tenantId: req.user.tenantId };
    
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('clientId', 'name company')
      .populate('manager', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) { next(err); }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
      .populate('clientId', 'name email phone company')
      .populate('manager', 'name email avatar')
      .populate('members', 'name avatar');
      
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    const timeLogs = await TimeLog.find({ projectId: project._id }).populate('userId', 'name');
    const projectData = project._doc || project;
    res.json({ success: true, data: { ...projectData, timeLogs } });
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.tenantId = req.user.tenantId;
    
    const project = await Project.create(req.body);
    await project.populate('clientId', 'name');
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true, runValidators: true }
    ).populate('clientId', 'name').populate('manager', 'name avatar');
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    await TimeLog.deleteMany({ projectId: req.params.id });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

const logTime = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    const timeLog = await TimeLog.create({
      ...req.body,
      projectId: project._id,
      tenantId: req.user.tenantId,
      userId: req.user._id
    });
    
    await timeLog.populate('userId', 'name');
    res.status(201).json({ success: true, data: timeLog });
  } catch (err) { next(err); }
};

const getAllTimeLogs = async (req, res, next) => {
  try {
    const timeLogs = await TimeLog.find({ tenantId: req.user.tenantId })
      .populate('projectId', 'name')
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: timeLogs });
  } catch (err) { next(err); }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, logTime, getAllTimeLogs };
