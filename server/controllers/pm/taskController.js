const ProjectTask = require('../../models/pm/ProjectTask');
const { autoCalculateProjectProgress } = require('../../utils/pm/autoCalculateProjectProgress');
const Project = require('../../models/Project');

// GET /api/pm/projects/:id/tasks
const getTasks = async (req, res, next) => {
  try {
    const { phase, workStream, assignee, status, priority, search, parentTask } = req.query;
    const query = { project: req.params.id };
    if (phase) query.phase = phase;
    if (workStream) query.workStream = workStream;
    if (assignee) query.assignedTo = assignee;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (parentTask === 'null') query.parentTask = null;
    else if (parentTask) query.parentTask = parentTask;
    if (search) query.name = { $regex: search, $options: 'i' };

    const tasks = await ProjectTask.find(query)
      .populate('assignedTo', 'name avatar')
      .populate('responsible', 'name avatar')
      .populate('accountable', 'name avatar')
      .populate('parentTask', 'name taskCode')
      .populate('dependencies.task', 'name taskCode')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/tasks
const createTask = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    req.body.createdBy = req.user._id;

    const task = await ProjectTask.create(req.body);
    await task.populate('assignedTo', 'name avatar');

    // Update project progress
    const progress = await autoCalculateProjectProgress(req.params.id);
    await Project.updateOne({ _id: req.params.id }, { progressPercent: progress });

    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

// PUT /api/pm/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await ProjectTask.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name avatar')
      .populate('responsible', 'name avatar');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Update project progress
    const progress = await autoCalculateProjectProgress(task.project);
    await Project.updateOne({ _id: task.project }, { progressPercent: progress });

    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// DELETE /api/pm/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await ProjectTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Remove from other tasks' dependencies
    await ProjectTask.updateMany(
      { 'dependencies.task': req.params.id },
      { $pull: { dependencies: { task: req.params.id } } }
    );

    // Update project progress
    const progress = await autoCalculateProjectProgress(task.project);
    await Project.updateOne({ _id: task.project }, { progressPercent: progress });

    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

// POST /api/pm/tasks/:id/dependencies
const addDependency = async (req, res, next) => {
  try {
    const { taskId, type, lagDays } = req.body;
    const task = await ProjectTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Check for circular dependency
    const visited = new Set();
    const checkCircular = async (currentId) => {
      if (visited.has(currentId)) return false;
      if (currentId === req.params.id) return true;
      visited.add(currentId);
      const t = await ProjectTask.findById(currentId);
      if (!t) return false;
      for (const dep of t.dependencies || []) {
        if (await checkCircular(dep.task.toString())) return true;
      }
      return false;
    };

    if (await checkCircular(taskId)) {
      return res.status(400).json({ success: false, message: 'Circular dependency detected' });
    }

    task.dependencies.push({ task: taskId, type: type || 'FS', lagDays: lagDays || 0 });
    await task.save();
    await task.populate('dependencies.task', 'name taskCode');

    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, addDependency };
