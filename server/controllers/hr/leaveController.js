const Leave = require('../../models/hr/Leave');
const LeaveType = require('../../models/hr/LeaveType');
const LeaveBalance = require('../../models/hr/LeaveBalance');
const Employee = require('../../models/hr/Employee');
const calculateLeaveDays = require('../../utils/hr/calculateLeaveDays');

// Apply for a new leave
exports.applyLeave = async (req, res, next) => {
  try {
    let employeeId = req.body.employee;
    if (!employeeId && req.employee) {
      employeeId = req.employee._id;
    }

    const { leaveType: leaveTypeId, startDate, endDate, reason, attachmentUrl } = req.body;

    if (!employeeId || !leaveTypeId || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required leave application fields.' });
    }

    const employee = await Employee.findById(employeeId).populate('shift');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType || leaveType.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Leave type not found or is currently inactive.' });
    }

    // Exclude weekends and calendar holidays to calculate exact charge days
    const totalDays = await calculateLeaveDays(startDate, endDate, employee.shift);
    if (totalDays <= 0) {
      return res.status(400).json({ success: false, message: 'Selected date range contains no working days.' });
    }

    const currentYear = new Date(startDate).getFullYear();

    // Retrieve or initialize the employee's leave balance for this type and year
    let balance = await LeaveBalance.findOne({
      employee: employeeId,
      leaveType: leaveTypeId,
      year: currentYear,
    });

    if (!balance) {
      balance = await LeaveBalance.create({
        employee: employeeId,
        leaveType: leaveTypeId,
        year: currentYear,
        allocated: leaveType.daysAllowedPerYear,
        used: 0,
        pending: 0,
      });
    }

    // Check availability
    const availableDays = balance.allocated - balance.used - balance.pending;
    if (leaveType.name !== 'Unpaid' && availableDays < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. You have ${availableDays} days available, but requested ${totalDays} days.`,
      });
    }

    // Create leave application
    const leave = await Leave.create({
      employee: employeeId,
      leaveType: leaveTypeId,
      startDate,
      endDate,
      totalDays,
      reason,
      attachmentUrl,
      status: 'pending',
      appliedAt: new Date(),
    });

    // Update pending days on the balance sheet
    balance.pending += totalDays;
    await balance.save();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// Approve leave application
exports.approveLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Application already ${leave.status}.` });
    }

    const currentYear = new Date(leave.startDate).getFullYear();
    const balance = await LeaveBalance.findOne({
      employee: leave.employee,
      leaveType: leave.leaveType,
      year: currentYear,
    });

    if (balance) {
      // Move total days from pending to used
      balance.pending = Math.max(0, balance.pending - leave.totalDays);
      balance.used += leave.totalDays;
      await balance.save();
    }

    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave application approved.',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// Reject leave application
exports.rejectLeave = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found.' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Application already ${leave.status}.` });
    }

    const currentYear = new Date(leave.startDate).getFullYear();
    const balance = await LeaveBalance.findOne({
      employee: leave.employee,
      leaveType: leave.leaveType,
      year: currentYear,
    });

    if (balance) {
      // Revert pending days
      balance.pending = Math.max(0, balance.pending - leave.totalDays);
      await balance.save();
    }

    leave.status = 'rejected';
    leave.rejectionReason = rejectionReason;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave application rejected.',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// List all leaves for administrators/HR with filters
exports.listLeaves = async (req, res, next) => {
  try {
    const { employeeId, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (req.employee) {
      query.employee = req.employee._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (status) {
      query.status = status;
    }

    const count = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('leaveType')
      .sort('-appliedAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve current year balance matrix of an employee
exports.getLeaveBalances = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId || (req.employee ? req.employee._id : null);
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee reference is required.' });
    }

    const year = Number(req.query.year) || new Date().getFullYear();

    const balances = await LeaveBalance.find({ employee: employeeId, year })
      .populate('leaveType');

    res.status(200).json({
      success: true,
      data: balances,
    });
  } catch (error) {
    next(error);
  }
};
