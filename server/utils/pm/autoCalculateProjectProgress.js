const ProjectTask = require('../../models/pm/ProjectTask');

/**
 * Auto-calculate project progress percentage based on task completion.
 *
 * Uses weighted average: each task's progress contributes based on its estimated hours.
 * If no hours estimated, each task weighs equally.
 *
 * @param {String} projectId - The project's ObjectId
 * @returns {Number} progressPercent (0-100)
 */
const autoCalculateProjectProgress = async (projectId) => {
  const tasks = await ProjectTask.find({
    project: projectId,
    status: { $ne: 'cancelled' },
    parentTask: null, // Only top-level tasks
  }).select('progressPercent estimatedHours status');

  if (tasks.length === 0) return 0;

  const hasWeights = tasks.some(t => t.estimatedHours > 0);

  if (hasWeights) {
    let totalWeight = 0;
    let weightedProgress = 0;

    tasks.forEach(t => {
      const weight = t.estimatedHours || 1;
      totalWeight += weight;
      weightedProgress += (t.progressPercent || 0) * weight;
    });

    return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
  } else {
    const totalProgress = tasks.reduce((sum, t) => sum + (t.progressPercent || 0), 0);
    return Math.round(totalProgress / tasks.length);
  }
};

module.exports = { autoCalculateProjectProgress };
