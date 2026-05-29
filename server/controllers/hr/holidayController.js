const Holiday = require('../../models/hr/Holiday');

exports.createHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Holiday record registered successfully',
      data: holiday,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHolidays = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    const holidays = await Holiday.find({
      date: { $gte: startDate, $lte: endDate },
    }).sort('date');

    res.status(200).json({
      success: true,
      data: holidays,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday record not found' });
    }
    res.status(200).json({
      success: true,
      data: holiday,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday record not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Holiday record updated successfully',
      data: holiday,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday record not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Holiday record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
