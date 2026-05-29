const Shift = require('../../models/hr/Shift');

exports.createShift = async (req, res, next) => {
  try {
    const shift = await Shift.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Work shift created successfully',
      data: shift,
    });
  } catch (error) {
    next(error);
  }
};

exports.getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find();
    res.status(200).json({
      success: true,
      data: shifts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getShift = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Work shift updated successfully',
      data: shift,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Work shift deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
