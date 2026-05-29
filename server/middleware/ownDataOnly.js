const Employee = require('../models/hr/Employee');

const ownDataOnly = async (req, res, next) => {
  // Admins, managers, and HR can access all employees' data
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'hr')) {
    return next();
  }

  try {
    // Find the employee record linked to this login user account
    const employee = await Employee.findOne({ userId: req.user._id });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found for this user account. Access restricted.',
      });
    }

    // Cache the resolved employee on request object for convenience in downstream controllers
    req.employee = employee;

    // Determine target employee ID from parameters, query string, or body parameters
    const targetEmployeeId = req.params.employeeId || req.query.employeeId || req.body.employee;

    if (targetEmployeeId && targetEmployeeId.toString() !== employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only authorized to access your own employee data records.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal authorization validation failure.',
      error: error.message,
    });
  }
};

module.exports = ownDataOnly;
