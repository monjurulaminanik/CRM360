const Project = require('../../models/Project');
const ProjectTask = require('../../models/pm/ProjectTask');
const ProjectMilestone = require('../../models/pm/ProjectMilestone');

// GET /api/pm/dashboard
const getPortfolioDashboard = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    // Phase distribution
    const phaseStats = await Project.aggregate([
      { $match: { tenantId, isDeleted: { $ne: true }, isTemplate: { $ne: true } } },
      { $group: { _id: '$currentPhase', count: { $sum: 1 } } },
    ]);

    // RAG distribution
    const ragStats = await Project.aggregate([
      { $match: { tenantId, isDeleted: { $ne: true }, isTemplate: { $ne: true } } },
      { $group: { _id: '$ragStatus', count: { $sum: 1 } } },
    ]);

    // Type distribution
    const typeStats = await Project.aggregate([
      { $match: { tenantId, isDeleted: { $ne: true }, isTemplate: { $ne: true } } },
      { $group: { _id: '$projectType', count: { $sum: 1 } } },
    ]);

    // Budget summary
    const budgetSummary = await Project.aggregate([
      { $match: { tenantId, isDeleted: { $ne: true }, isTemplate: { $ne: true } } },
      { $group: {
        _id: null,
        totalEstimated: { $sum: '$estimatedBudget' },
        totalSpent: { $sum: '$actualSpent' },
        totalProjects: { $sum: 1 },
      }},
    ]);

    // At-risk projects
    const atRiskCount = await Project.countDocuments({
      tenantId, isDeleted: { $ne: true }, isTemplate: { $ne: true },
      ragStatus: { $in: ['amber', 'red'] },
    });

    // Projects closing this month
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const closingThisMonth = await Project.countDocuments({
      tenantId, isDeleted: { $ne: true },
      targetEndDate: { $gte: now, $lte: endOfMonth },
    });

    // Upcoming milestones (next 30 days)
    const thirtyDays = new Date(Date.now() + 30 * 86400000);
    const upcomingMilestones = await ProjectMilestone.find({
      tenantId, targetDate: { $gte: now, $lte: thirtyDays },
      status: { $in: ['pending', 'on-track', 'at-risk'] },
    })
      .populate({ path: 'project', select: 'name projectCode', match: { isDeleted: { $ne: true } } })
      .sort({ targetDate: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalProjects: budgetSummary[0]?.totalProjects || 0,
        totalBudget: budgetSummary[0]?.totalEstimated || 0,
        totalSpent: budgetSummary[0]?.totalSpent || 0,
        atRiskCount,
        closingThisMonth,
        phaseStats: phaseStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        ragStats: ragStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        typeStats: typeStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        upcomingMilestones: upcomingMilestones.filter(m => m.project),
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getPortfolioDashboard };
