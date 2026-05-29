const LeaveType = require('../../models/hr/LeaveType');

exports.createLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Leave type created successfully',
      data: leaveType,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find();
    res.status(200).json({
      success: true,
      data: leaveTypes,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }
    res.status(200).json({
      success: true,
      data: leaveType,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Leave type updated successfully',
      data: leaveType,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Leave type deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
