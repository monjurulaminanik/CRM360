const ProjectSchedule = require('../../models/pm/ProjectSchedule');
const ProjectTask = require('../../models/pm/ProjectTask');
const { calculateCriticalPath } = require('../../utils/pm/calculateCriticalPath');

// GET /api/pm/projects/:id/schedule
const getSchedule = async (req, res, next) => {
  try {
    let schedule = await ProjectSchedule.findOne({ project: req.params.id })
      .populate('criticalPath', 'name taskCode startDate endDate status');
    if (!schedule) {
      schedule = await ProjectSchedule.create({ project: req.params.id, tenantId: req.user.tenantId });
    }
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/schedule/baseline
const lockBaseline = async (req, res, next) => {
  try {
    const schedule = await ProjectSchedule.findOne({ project: req.params.id });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    if (schedule.baselineLocked) return res.status(400).json({ success: false, message: 'Baseline is already locked' });

    // Lock all task baselines
    const tasks = await ProjectTask.find({ project: req.params.id });
    for (const task of tasks) {
      task.baselineStart = task.startDate;
      task.baselineEnd = task.endDate;
      await task.save();
    }

    schedule.baselineLocked = true;
    schedule.baselineLockedAt = new Date();
    schedule.baselineLockedBy = req.user._id;
    if (tasks.length > 0) {
      const starts = tasks.filter(t => t.startDate).map(t => t.startDate);
      const ends = tasks.filter(t => t.endDate).map(t => t.endDate);
      if (starts.length) schedule.baselineStart = new Date(Math.min(...starts));
      if (ends.length) schedule.baselineEnd = new Date(Math.max(...ends));
    }
    await schedule.save();

    res.json({ success: true, data: schedule, message: 'Baseline locked successfully' });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id/critical-path
const getCriticalPath = async (req, res, next) => {
  try {
    const tasks = await ProjectTask.find({ project: req.params.id, status: { $ne: 'cancelled' } });
    const result = calculateCriticalPath(tasks);

    // Update schedule with critical path
    await ProjectSchedule.findOneAndUpdate(
      { project: req.params.id },
      { criticalPath: result.criticalPath }
    );

    // Mark tasks as critical
    await ProjectTask.updateMany({ project: req.params.id }, { isCritical: false });
    if (result.criticalPath.length > 0) {
      await ProjectTask.updateMany({ _id: { $in: result.criticalPath } }, { isCritical: true });
    }

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id/gantt-data
const getGanttData = async (req, res, next) => {
  try {
    const tasks = await ProjectTask.find({ project: req.params.id, status: { $ne: 'cancelled' } })
      .populate('assignedTo', 'name avatar')
      .populate('dependencies.task', 'taskCode name')
      .sort({ startDate: 1 });

    const milestones = (await ProjectSchedule.findOne({ project: req.params.id }))?.milestones || [];

    res.json({
      success: true,
      data: {
        tasks: tasks.map(t => ({
          id: t._id,
          taskCode: t.taskCode,
          name: t.name,
          startDate: t.startDate,
          endDate: t.endDate,
          baselineStart: t.baselineStart,
          baselineEnd: t.baselineEnd,
          progress: t.progressPercent,
          status: t.status,
          workStream: t.workStream,
          assignedTo: t.assignedTo,
          dependencies: t.dependencies,
          isCritical: t.isCritical,
          isMilestone: t.isMilestone,
          parentTask: t.parentTask,
        })),
        milestones,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getSchedule, lockBaseline, getCriticalPath, getGanttData };
