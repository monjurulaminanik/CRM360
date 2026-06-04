const ProjectResource = require('../../models/pm/ProjectResource');

/**
 * Detect resource conflicts across projects.
 * A conflict exists when a person's total allocation across projects exceeds 100%.
 *
 * @param {String} userId - User ObjectId
 * @param {String} tenantId - Tenant ObjectId
 * @param {Date} startDate - Check period start
 * @param {Date} endDate - Check period end
 * @param {String} excludeProjectId - Optional project to exclude (for updates)
 * @returns {Object} { hasConflict, totalAllocation, projects }
 */
const detectResourceConflicts = async (userId, tenantId, startDate, endDate, excludeProjectId = null) => {
  const query = {
    resource: userId,
    tenantId,
    status: 'allocated',
  };

  // Check overlapping dates
  if (startDate && endDate) {
    query.$or = [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: null },
    ];
  }

  if (excludeProjectId) {
    query.project = { $ne: excludeProjectId };
  }

  const allocations = await ProjectResource.find(query)
    .populate('project', 'name projectCode currentPhase')
    .lean();

  const totalAllocation = allocations.reduce((sum, a) => sum + (a.allocationPercent || 0), 0);

  return {
    hasConflict: totalAllocation > 100,
    totalAllocation,
    availablePercent: Math.max(0, 100 - totalAllocation),
    projects: allocations.map(a => ({
      projectId: a.project?._id,
      projectName: a.project?.name,
      projectCode: a.project?.projectCode,
      allocationPercent: a.allocationPercent,
      startDate: a.startDate,
      endDate: a.endDate,
    })),
  };
};

/**
 * Get resource availability across all projects for a team
 */
const getTeamAvailability = async (userIds, tenantId) => {
  const results = [];

  for (const userId of userIds) {
    const conflict = await detectResourceConflicts(userId, tenantId);
    results.push({
      userId,
      ...conflict,
    });
  }

  return results;
};

module.exports = { detectResourceConflicts, getTeamAvailability };
