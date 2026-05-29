const Employee = require('../../models/hr/Employee');

/**
 * Automatically calculates the next employee ID in sequence.
 * Format: DIT-EMP-001, DIT-EMP-002, etc.
 */
const generateEmployeeId = async () => {
  try {
    const lastEmployee = await Employee.findOne({}, { employeeId: 1 })
      .sort({ employeeId: -1 });

    if (!lastEmployee || !lastEmployee.employeeId) {
      return 'DIT-EMP-001';
    }

    const parts = lastEmployee.employeeId.split('-');
    if (parts.length < 3) {
      return 'DIT-EMP-001';
    }

    const lastNum = parseInt(parts[2], 10);
    if (isNaN(lastNum)) {
      return 'DIT-EMP-001';
    }

    const nextNum = lastNum + 1;
    return `DIT-EMP-${String(nextNum).padStart(3, '0')}`;
  } catch {
    // Safe random fallback if database query encounters errors
    return `DIT-EMP-${Math.floor(100 + Math.random() * 900)}`;
  }
};

module.exports = generateEmployeeId;
