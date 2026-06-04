/**
 * Critical Path Method (CPM) algorithm.
 * Calculates the longest path through a project's task dependency network.
 *
 * @param {Array} tasks - Array of ProjectTask documents
 * @returns {Object} { criticalPath: [taskIds], criticalDurationDays }
 */
const calculateCriticalPath = (tasks) => {
  if (!tasks || tasks.length === 0) return { criticalPath: [], criticalDurationDays: 0 };

  // Build adjacency list and duration map
  const taskMap = new Map();
  const adjacency = new Map();
  const inDegree = new Map();

  tasks.forEach(t => {
    const id = t._id.toString();
    const durationDays = (t.startDate && t.endDate)
      ? Math.max(1, Math.ceil((t.endDate - t.startDate) / (1000 * 60 * 60 * 24)))
      : (t.estimatedHours ? Math.ceil(t.estimatedHours / 8) : 1);

    taskMap.set(id, { ...t.toObject ? t.toObject() : t, durationDays });
    adjacency.set(id, []);
    inDegree.set(id, 0);
  });

  // Build edges from dependencies
  tasks.forEach(t => {
    const id = t._id.toString();
    (t.dependencies || []).forEach(dep => {
      const depId = dep.task?.toString();
      if (depId && taskMap.has(depId)) {
        adjacency.get(depId).push({ target: id, lag: dep.lagDays || 0 });
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
      }
    });
  });

  // Forward pass: calculate earliest start (ES) and earliest finish (EF)
  const es = new Map(); // Earliest Start
  const ef = new Map(); // Earliest Finish

  // Topological sort using Kahn's algorithm
  const queue = [];
  taskMap.forEach((task, id) => {
    if ((inDegree.get(id) || 0) === 0) {
      queue.push(id);
      es.set(id, 0);
      ef.set(id, task.durationDays);
    }
  });

  const topoOrder = [];
  while (queue.length > 0) {
    const current = queue.shift();
    topoOrder.push(current);

    (adjacency.get(current) || []).forEach(({ target, lag }) => {
      const newEs = (ef.get(current) || 0) + lag;
      if (!es.has(target) || newEs > es.get(target)) {
        es.set(target, newEs);
        ef.set(target, newEs + taskMap.get(target).durationDays);
      }

      inDegree.set(target, (inDegree.get(target) || 0) - 1);
      if (inDegree.get(target) === 0) {
        queue.push(target);
      }
    });
  }

  // Find project duration (max EF)
  let projectDuration = 0;
  ef.forEach(val => { if (val > projectDuration) projectDuration = val; });

  // Backward pass: calculate latest start (LS) and latest finish (LF)
  const ls = new Map();
  const lf = new Map();

  // Initialize all LF to project duration
  taskMap.forEach((task, id) => {
    lf.set(id, projectDuration);
    ls.set(id, projectDuration - task.durationDays);
  });

  // Process in reverse topological order
  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const current = topoOrder[i];
    (adjacency.get(current) || []).forEach(({ target, lag }) => {
      const newLf = (ls.get(target) || 0) - lag;
      if (newLf < lf.get(current)) {
        lf.set(current, newLf);
        ls.set(current, newLf - taskMap.get(current).durationDays);
      }
    });
  }

  // Calculate float and identify critical path
  const criticalPath = [];
  topoOrder.forEach(id => {
    const float = (ls.get(id) || 0) - (es.get(id) || 0);
    if (Math.abs(float) < 0.001) {
      criticalPath.push(id);
    }
  });

  return {
    criticalPath,
    criticalDurationDays: projectDuration,
    taskDetails: topoOrder.map(id => ({
      taskId: id,
      taskName: taskMap.get(id).name,
      duration: taskMap.get(id).durationDays,
      es: es.get(id) || 0,
      ef: ef.get(id) || 0,
      ls: ls.get(id) || 0,
      lf: lf.get(id) || 0,
      float: (ls.get(id) || 0) - (es.get(id) || 0),
      isCritical: Math.abs((ls.get(id) || 0) - (es.get(id) || 0)) < 0.001,
    })),
  };
};

module.exports = { calculateCriticalPath };
