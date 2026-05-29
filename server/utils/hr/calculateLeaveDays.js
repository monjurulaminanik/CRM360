const calculateWorkingDays = require('./calculateWorkingDays');

/**
 * Calculates how many leave balance days will be charged for a leave application range,
 * excluding holidays and weekends.
 */
const calculateLeaveDays = async (startDate, endDate, shift = null) => {
  return await calculateWorkingDays(startDate, endDate, shift);
};

module.exports = calculateLeaveDays;
