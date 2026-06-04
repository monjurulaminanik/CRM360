/**
 * Earned Value Management (EVM) Calculator
 *
 * Key formulas:
 * - SPI = EV / PV  (Schedule Performance Index)
 * - CPI = EV / AC  (Cost Performance Index)
 * - SV  = EV - PV  (Schedule Variance)
 * - CV  = EV - AC  (Cost Variance)
 * - EAC = BAC / CPI (Estimate at Completion)
 * - ETC = EAC - AC  (Estimate to Complete)
 * - VAC = BAC - EAC (Variance at Completion)
 *
 * @param {Object} params
 * @param {Number} params.bac - Budget at Completion
 * @param {Number} params.percentComplete - Overall project completion %
 * @param {Number} params.percentScheduled - Scheduled completion % by now
 * @param {Number} params.actualCost - Actual cost spent so far
 * @returns {Object} EVM metrics
 */
const calculateEVM = ({ bac, percentComplete, percentScheduled, actualCost }) => {
  if (!bac || bac === 0) {
    return {
      plannedValue: 0, earnedValue: 0, actualCost: actualCost || 0,
      spi: null, cpi: null, sv: 0, cv: 0,
      eac: 0, etc: 0, vac: 0, bac: 0,
      healthStatus: 'green',
    };
  }

  const pv = bac * ((percentScheduled || 0) / 100); // Planned Value
  const ev = bac * ((percentComplete || 0) / 100);   // Earned Value
  const ac = actualCost || 0;                         // Actual Cost

  const spi = pv > 0 ? +(ev / pv).toFixed(3) : null;
  const cpi = ac > 0 ? +(ev / ac).toFixed(3) : null;
  const sv = +(ev - pv).toFixed(2);
  const cv = +(ev - ac).toFixed(2);

  const eac = cpi && cpi > 0 ? +(bac / cpi).toFixed(2) : bac;
  const etc = +(eac - ac).toFixed(2);
  const vac = +(bac - eac).toFixed(2);

  // Determine health
  let healthStatus = 'green';
  if (cpi !== null && cpi < 0.9) healthStatus = 'red';
  else if (cpi !== null && cpi < 1.0) healthStatus = 'amber';
  if (spi !== null && spi < 0.9) healthStatus = 'red';
  else if (spi !== null && spi < 1.0 && healthStatus !== 'red') healthStatus = 'amber';

  return {
    plannedValue: +pv.toFixed(2),
    earnedValue: +ev.toFixed(2),
    actualCost: +ac.toFixed(2),
    spi,
    cpi,
    sv,
    cv,
    eac,
    etc: Math.max(0, etc),
    vac,
    bac,
    healthStatus,
  };
};

/**
 * Calculate percent scheduled based on project timeline
 */
const calculatePercentScheduled = (startDate, targetEndDate) => {
  if (!startDate || !targetEndDate) return 0;

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(targetEndDate);

  if (now <= start) return 0;
  if (now >= end) return 100;

  const totalDuration = end - start;
  const elapsed = now - start;
  return +(elapsed / totalDuration * 100).toFixed(2);
};

module.exports = { calculateEVM, calculatePercentScheduled };
