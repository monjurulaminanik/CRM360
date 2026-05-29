/**
 * Calculates attendance status (present, late, half-day, absent)
 * by comparing check-in timestamp against shift rules.
 */
const attendanceStatusCalculator = (checkInTime, attendanceDate, shift) => {
  if (!checkInTime) {
    return 'absent';
  }
  if (!shift || !shift.startTime) {
    return 'present';
  }

  const checkIn = new Date(checkInTime);
  const attDate = new Date(attendanceDate);

  // Parse shift start time (format "HH:MM", e.g., "09:00")
  const [startHour, startMinute] = shift.startTime.split(':').map(Number);
  if (isNaN(startHour) || isNaN(startMinute)) {
    return 'present';
  }

  // Create expected shift start date/time on the attendance day
  const expectedStart = new Date(attDate);
  expectedStart.setHours(startHour, startMinute, 0, 0);

  // Time diff in minutes
  const diffMs = checkIn.getTime() - expectedStart.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  const halfDayLimit = shift.halfDayAfter !== undefined ? shift.halfDayAfter : 120;
  const lateMarkLimit = shift.lateMarkAfter !== undefined ? shift.lateMarkAfter : 15;

  if (diffMinutes > halfDayLimit) {
    return 'half-day';
  } else if (diffMinutes > lateMarkLimit) {
    return 'late';
  }

  return 'present';
};

module.exports = attendanceStatusCalculator;
