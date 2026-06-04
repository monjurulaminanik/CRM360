const ProjectCharter = require('../../models/pm/ProjectCharter');
const ProjectSchedule = require('../../models/pm/ProjectSchedule');
const ProjectClosure = require('../../models/pm/ProjectClosure');
const ProjectMilestone = require('../../models/pm/ProjectMilestone');
const ProjectTask = require('../../models/pm/ProjectTask');

/**
 * Phase transition rules:
 * - initiation → planning: Charter must be approved
 * - planning → execution: Baseline must be locked
 * - execution → monitoring: At least one task in progress
 * - monitoring → closure: All critical milestones achieved or PM override
 * - Any → cancelled/on-hold: Always allowed for admin/PM
 */

const PHASE_ORDER = ['initiation', 'planning', 'execution', 'monitoring', 'closure'];

const phaseTransitionValidator = async (req, res, next) => {
  try {
    const { targetPhase } = req.body;
    const project = req.project;

    if (!targetPhase) {
      return res.status(400).json({ success: false, message: 'Target phase is required' });
    }

    // Allow cancel/hold from any phase
    if (['cancelled', 'on-hold'].includes(targetPhase)) {
      return next();
    }

    // Re-activate from on-hold (return to previous phase)
    if (project.currentPhase === 'on-hold') {
      return next();
    }

    // Cannot transition from cancelled
    if (project.currentPhase === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot transition from cancelled state. Create a new project instead.',
      });
    }

    const currentIdx = PHASE_ORDER.indexOf(project.currentPhase);
    const targetIdx = PHASE_ORDER.indexOf(targetPhase);

    if (targetIdx < 0) {
      return res.status(400).json({ success: false, message: `Invalid target phase: ${targetPhase}` });
    }

    // Cannot skip phases (must go sequentially)
    if (targetIdx > currentIdx + 1) {
      return res.status(400).json({
        success: false,
        message: `Cannot skip phases. Current: ${project.currentPhase}, must go to ${PHASE_ORDER[currentIdx + 1]} first.`,
      });
    }

    // Cannot go backward
    if (targetIdx < currentIdx) {
      return res.status(400).json({
        success: false,
        message: `Cannot move backward from ${project.currentPhase} to ${targetPhase}`,
      });
    }

    // Validate phase-specific criteria
    const validationErrors = [];

    // initiation → planning
    if (project.currentPhase === 'initiation' && targetPhase === 'planning') {
      const charter = await ProjectCharter.findOne({ project: project._id });
      if (!charter) {
        validationErrors.push('Project Charter must be created before moving to Planning');
      } else if (charter.charterStatus !== 'approved' && charter.charterStatus !== 'signed') {
        validationErrors.push(`Project Charter must be approved (current status: ${charter.charterStatus})`);
      }
    }

    // planning → execution
    if (project.currentPhase === 'planning' && targetPhase === 'execution') {
      const schedule = await ProjectSchedule.findOne({ project: project._id });
      if (!schedule) {
        validationErrors.push('Project Schedule must be created before moving to Execution');
      } else if (!schedule.baselineLocked) {
        validationErrors.push('Schedule baseline must be locked before moving to Execution');
      }
    }

    // execution → monitoring
    if (project.currentPhase === 'execution' && targetPhase === 'monitoring') {
      const tasksInProgress = await ProjectTask.countDocuments({
        project: project._id,
        status: { $in: ['in-progress', 'review', 'done'] },
      });
      if (tasksInProgress === 0) {
        validationErrors.push('At least one task must be started before moving to Monitoring');
      }
    }

    // monitoring → closure
    if (project.currentPhase === 'monitoring' && targetPhase === 'closure') {
      const pendingMilestones = await ProjectMilestone.countDocuments({
        project: project._id,
        status: { $in: ['pending', 'on-track', 'at-risk'] },
      });
      if (pendingMilestones > 0) {
        validationErrors.push(`${pendingMilestones} milestone(s) are still pending. Achieve or cancel them first.`);
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phase transition requirements not met',
        errors: validationErrors,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { phaseTransitionValidator, PHASE_ORDER };
