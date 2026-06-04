const Project = require('../../models/Project');

/**
 * Middleware: Check if the current user has access to the project.
 * Rules:
 * - Admin/manager: access to all projects in their tenant
 * - Team members: access to projects they are on
 * - Project Manager: access to their projects
 */
const projectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    if (!projectId) return next();

    const project = await Project.findOne({
      _id: projectId,
      tenantId: req.user.tenantId,
      isDeleted: { $ne: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Admin and manager have full access
    if (['admin', 'superadmin', 'manager'].includes(req.user.role)) {
      req.project = project;
      return next();
    }

    // Check if user is PM, sponsor, or team member
    const userId = req.user._id.toString();
    const isPM = project.projectManager?.toString() === userId;
    const isSponsor = project.sponsor?.toString() === userId;
    const isTeamMember = project.teamMembers?.some(tm => tm.user?.toString() === userId);

    if (isPM || isSponsor || isTeamMember) {
      req.project = project;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have access to this project',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Check if user can edit the project (PM, admin, or manager only)
 */
const projectEditAccess = async (req, res, next) => {
  try {
    if (!req.project) {
      return res.status(404).json({ success: false, message: 'Project not loaded' });
    }

    if (['admin', 'superadmin', 'manager'].includes(req.user.role)) {
      return next();
    }

    const userId = req.user._id.toString();
    const isPM = req.project.projectManager?.toString() === userId;

    if (isPM) return next();

    return res.status(403).json({
      success: false,
      message: 'Only the Project Manager, admin, or manager can edit this project',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { projectAccess, projectEditAccess };
