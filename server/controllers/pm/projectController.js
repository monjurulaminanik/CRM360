const Project = require('../../models/Project');
const ProjectCharter = require('../../models/pm/ProjectCharter');
const ProjectSchedule = require('../../models/pm/ProjectSchedule');
const ProjectBudget = require('../../models/pm/ProjectBudget');
const ProjectTask = require('../../models/pm/ProjectTask');
const ProjectMilestone = require('../../models/pm/ProjectMilestone');
const RAIDDLog = require('../../models/pm/RAIDDLog');
const { autoCalculateProjectProgress } = require('../../utils/pm/autoCalculateProjectProgress');

// GET /api/pm/projects
const getProjects = async (req, res, next) => {
  try {
    const { phase, status, client, pm, rag, type, search, isTemplate, page = 1, limit = 50 } = req.query;
    const query = { tenantId: req.user.tenantId, isDeleted: { $ne: true } };

    if (phase) query.currentPhase = phase;
    if (status) query.overallStatus = status;
    if (client) query.client = client;
    if (pm) query.projectManager = pm;
    if (rag) query.ragStatus = rag;
    if (type) query.projectType = type;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { projectCode: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('client', 'name company email')
      .populate('projectManager', 'name email avatar')
      .populate('sponsor', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: projects.length, total, page: Number(page), data: projects });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, tenantId: req.user.tenantId, isDeleted: { $ne: true } })
      .populate('client', 'name company email phone whatsappNumber')
      .populate('projectManager', 'name email avatar')
      .populate('sponsor', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar role')
      .populate('linkedInvoices');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

// POST /api/pm/projects
const createProject = async (req, res, next) => {
  try {
    req.body.tenantId = req.user.tenantId;
    req.body.createdBy = req.user._id;
    if (!req.body.projectManager) req.body.projectManager = req.user._id;

    console.log('Project creation body:', req.body);
    const project = await Project.create(req.body);
    console.log('Created project:', project);
    // Auto-create empty charter draft
    await ProjectCharter.create({
      project: project._id,
      tenantId: req.user.tenantId,
      charterStatus: 'draft',
    });

    // Auto-create empty schedule
    await ProjectSchedule.create({
      project: project._id,
      tenantId: req.user.tenantId,
      workStreams: [
        { name: 'Strategy', color: '#6366F1' },
        { name: 'Design', color: '#EC4899' },
        { name: 'Development', color: '#2D55FF' },
        { name: 'Content', color: '#10B981' },
        { name: 'Marketing', color: '#F59E0B' },
        { name: 'QA', color: '#EF4444' },
        { name: 'Deployment', color: '#8B5CF6' },
      ],
    });

    // Auto-create empty budget
    await ProjectBudget.create({
      project: project._id,
      tenantId: req.user.tenantId,
      totalBudget: req.body.estimatedBudget || 0,
      currency: req.body.currency || 'BDT',
      earnedValueData: { bac: req.body.estimatedBudget || 0 },
    });

    // Auto-create empty RAIDD log
    await RAIDDLog.create({
      project: project._id,
      tenantId: req.user.tenantId,
      entries: [],
    });

    await project.populate('client', 'name company');
    await project.populate('projectManager', 'name avatar');

    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

// PUT /api/pm/projects/:id
const updateProject = async (req, res, next) => {
  try {
    // Don't allow changing tenantId or createdBy
    delete req.body.tenantId;
    delete req.body.createdBy;
    delete req.body.projectCode;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId, isDeleted: { $ne: true } },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('client', 'name company')
      .populate('projectManager', 'name avatar')
      .populate('teamMembers.user', 'name avatar');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

// DELETE /api/pm/projects/:id (soft delete)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, message: 'Project archived successfully' });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/move-phase
const movePhase = async (req, res, next) => {
  try {
    const { targetPhase } = req.body;
    const project = req.project; // Set by projectAccess middleware

    project.currentPhase = targetPhase;

    // Update overall status based on phase
    if (targetPhase === 'execution' || targetPhase === 'monitoring') {
      project.overallStatus = 'in-progress';
    } else if (targetPhase === 'closure') {
      project.overallStatus = 'completed';
      project.actualEndDate = new Date();
    } else if (targetPhase === 'cancelled') {
      project.overallStatus = 'cancelled';
      project.actualEndDate = new Date();
    }

    await project.save();

    res.json({ success: true, data: project, message: `Project moved to ${targetPhase} phase` });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id/dashboard
const getProjectDashboard = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = req.project;

    // Calculate progress
    const progress = await autoCalculateProjectProgress(projectId);

    // Get task stats
    const taskStats = await ProjectTask.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get milestone stats
    const milestoneStats = await ProjectMilestone.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get budget
    const budget = await ProjectBudget.findOne({ project: projectId });

    // Get open RAIDD entries
    const raidd = await RAIDDLog.findOne({ project: projectId });
    const openRisks = raidd?.entries?.filter(e => e.type === 'risk' && e.status === 'open') || [];
    const openIssues = raidd?.entries?.filter(e => e.type === 'issue' && e.status === 'open') || [];

    // Update project progress
    if (progress !== project.progressPercent) {
      await Project.updateOne({ _id: projectId }, { progressPercent: progress });
    }

    res.json({
      success: true,
      data: {
        progress,
        taskStats: taskStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        milestoneStats: milestoneStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        budget: budget ? {
          totalBudget: budget.totalBudget,
          totalActual: budget.totalActual,
          budgetHealth: budget.budgetHealth,
          evm: budget.earnedValueData,
        } : null,
        openRisks: openRisks.length,
        openIssues: openIssues.length,
        topRisks: openRisks.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)).slice(0, 5),
        topIssues: openIssues.slice(0, 5),
      },
    });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/clone
const cloneProject = async (req, res, next) => {
  try {
    const source = await Project.findOne({ _id: req.params.id, tenantId: req.user.tenantId }).lean();
    if (!source) return res.status(404).json({ success: false, message: 'Source project not found' });

    // Remove fields that shouldn't be cloned
    delete source._id;
    delete source.__v;
    delete source.projectCode;
    delete source.createdAt;
    delete source.updatedAt;
    delete source.actualEndDate;
    delete source.actualDurationDays;
    delete source.actualSpent;
    delete source.progressPercent;
    delete source.isDeleted;
    delete source.deletedAt;

    source.name = req.body.name || `${source.name} (Copy)`;
    source.currentPhase = 'initiation';
    source.overallStatus = 'not-started';
    source.ragStatus = 'green';
    source.createdBy = req.user._id;
    source.clonedFrom = req.params.id;

    if (req.body.client) source.client = req.body.client;
    if (req.body.startDate) source.startDate = req.body.startDate;
    if (req.body.targetEndDate) source.targetEndDate = req.body.targetEndDate;

    const newProject = await Project.create(source);

    // Clone charter structure (empty fields)
    const sourceCharter = await ProjectCharter.findOne({ project: req.params.id }).lean();
    if (sourceCharter) {
      delete sourceCharter._id;
      delete sourceCharter.__v;
      delete sourceCharter.createdAt;
      delete sourceCharter.updatedAt;
      sourceCharter.project = newProject._id;
      sourceCharter.charterStatus = 'draft';
      sourceCharter.approvedBy = null;
      sourceCharter.approvedDate = null;
      await ProjectCharter.create(sourceCharter);
    }

    await newProject.populate('client', 'name company');

    res.status(201).json({ success: true, data: newProject });
  } catch (err) { next(err); }
};

module.exports = {
  getProjects, getProject, createProject, updateProject,
  deleteProject, movePhase, getProjectDashboard, cloneProject,
};
