const ProjectStatusReport = require('../../models/pm/ProjectStatusReport');
const Project = require('../../models/Project');
const ProjectBudget = require('../../models/pm/ProjectBudget');
const ProjectTask = require('../../models/pm/ProjectTask');
const RAIDDLog = require('../../models/pm/RAIDDLog');
const { generateStatusReportPDF } = require('../../utils/pm/generateStatusReportPDF');

// GET /api/pm/projects/:id/status-reports
const getStatusReports = async (req, res, next) => {
  try {
    const reports = await ProjectStatusReport.find({ project: req.params.id })
      .populate('preparedBy', 'name avatar')
      .sort({ reportNumber: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/status-reports (auto-generate)
const createStatusReport = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    // Get next report number
    const lastReport = await ProjectStatusReport.findOne({ project: projectId }).sort({ reportNumber: -1 });
    const reportNumber = (lastReport?.reportNumber || 0) + 1;

    // Auto-gather data
    const budget = await ProjectBudget.findOne({ project: projectId });
    const taskStats = await ProjectTask.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const totalTasks = taskStats.reduce((s, t) => s + t.count, 0);
    const doneTasks = taskStats.find(t => t._id === 'done')?.count || 0;

    const raidd = await RAIDDLog.findOne({ project: projectId });
    const openRisks = (raidd?.entries || []).filter(e => e.type === 'risk' && e.status === 'open');
    const openIssues = (raidd?.entries || []).filter(e => e.type === 'issue' && e.status === 'open');

    const reportData = {
      project: projectId,
      tenantId: req.user.tenantId,
      reportNumber,
      reportDate: new Date(),
      periodStart: req.body.periodStart || new Date(Date.now() - 7 * 86400000),
      periodEnd: req.body.periodEnd || new Date(),
      executiveSummary: req.body.executiveSummary || '',
      overallRag: { status: project.ragStatus, reason: '' },
      scheduleRag: { status: project.ragStatusReasons?.schedule?.status || 'green', reason: project.ragStatusReasons?.schedule?.reason || '' },
      budgetRag: { status: project.ragStatusReasons?.budget?.status || 'green', reason: project.ragStatusReasons?.budget?.reason || '' },
      scopeRag: { status: project.ragStatusReasons?.scope?.status || 'green', reason: '' },
      qualityRag: { status: project.ragStatusReasons?.quality?.status || 'green', reason: '' },
      riskRag: { status: project.ragStatusReasons?.risk?.status || 'green', reason: '' },
      progressThisPeriod: req.body.progressThisPeriod || [],
      planNextPeriod: req.body.planNextPeriod || [],
      top5Risks: openRisks.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)).slice(0, 5).map(r => ({
        entryId: r.entryId, description: r.description, probability: r.probability,
        impactLevel: r.impactLevel, riskScore: r.riskScore, status: r.status,
      })),
      openIssues: openIssues.slice(0, 10).map(i => ({
        entryId: i.entryId, description: i.description, priority: i.priority, status: i.status,
      })),
      decisionsNeeded: req.body.decisionsNeeded || [],
      budgetSnapshot: {
        plannedToDate: budget?.totalBudget || 0,
        actualToDate: budget?.totalActual || 0,
        variance: (budget?.totalBudget || 0) - (budget?.totalActual || 0),
        eac: budget?.earnedValueData?.eac || 0,
      },
      scheduleSnapshot: {
        completedTasks: doneTasks,
        plannedTasks: totalTasks,
        percentComplete: project.progressPercent || 0,
      },
      preparedBy: req.user._id,
    };

    const report = await ProjectStatusReport.create(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
};

// GET /api/pm/status-reports/:id/pdf
const getStatusReportPDF = async (req, res, next) => {
  try {
    const report = await ProjectStatusReport.findById(req.params.id).populate('preparedBy', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const project = await Project.findById(report.project).populate('client', 'name company');
    const pdfBuffer = await generateStatusReportPDF(report, project);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="status-report-${report.reportNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};

module.exports = { getStatusReports, createStatusReport, getStatusReportPDF };
