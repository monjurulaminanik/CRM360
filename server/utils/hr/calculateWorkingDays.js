const Holiday = require('../../models/hr/Holiday');

/**
 * Calculates number of corporate working days between two dates,
 * excluding holidays and weekends according to the employee's shift.
 * Weekdays map: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 */
const calculateWorkingDays = async (startDate, endDate, shift = null) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Retrieve all calendar holidays in this date range
  const holidays = await Holiday.find({
    date: { $gte: start, $lte: end },
  });

  const holidayTimestamps = holidays.map((h) => {
    const d = new Date(h.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  // Corporate workdays: Mon to Fri (1,2,3,4,5) by default unless shift specifies
  const activeWorkdays = shift && shift.workingDays ? shift.workingDays : [1, 2, 3, 4, 5];
  const workdaySet = new Set(activeWorkdays);

  let workingDaysCount = 0;
  const current = new Date(start);

  while (current <= end) {
    const currentDay = current.getDay();
    const isWeekend = !workdaySet.has(currentDay);
    const isHoliday = holidayTimestamps.includes(current.getTime());

    if (!isWeekend && !isHoliday) {
      workingDaysCount++;
    }

    current.setDate(current.getDate() + 1);
  }

  return workingDaysCount;
};

module.exports = calculateWorkingDays;
