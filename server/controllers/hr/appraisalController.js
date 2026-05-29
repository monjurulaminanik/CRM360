const Appraisal = require('../../models/hr/Appraisal');

exports.createAppraisal = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Employee performance review created successfully',
      data: appraisal,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppraisals = async (req, res, next) => {
  try {
    const { employeeId } = req.query;
    const query = {};

    if (req.employee) {
      query.employee = req.employee._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    const appraisals = await Appraisal.find(query)
      .populate('employee', 'firstName lastName employeeId email designation')
      .populate('reviewer', 'firstName lastName employeeId email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: appraisals,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppraisal = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.findById(req.params.id)
      .populate('employee')
      .populate('reviewer');

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Performance appraisal not found' });
    }

    res.status(200).json({
      success: true,
      data: appraisal,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAppraisal = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Performance appraisal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Performance appraisal updated successfully',
      data: appraisal,
    });
  } catch (error) {
    next(error);
  }
};

exports.submitAppraisal = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.findByIdAndUpdate(
      req.params.id,
      { status: 'submitted' },
      { new: true }
    );

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Performance appraisal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Performance appraisal submitted successfully for reviewer rating',
      data: appraisal,
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewAppraisal = async (req, res, next) => {
  try {
    const { reviewerRating, strengths, areasOfImprovement, goals, status = 'reviewed' } = req.body;

    const appraisal = await Appraisal.findByIdAndUpdate(
      req.params.id,
      {
        reviewerRating,
        strengths,
        areasOfImprovement,
        goals,
        status,
      },
      { new: true }
    );

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Performance appraisal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Performance appraisal reviewed and finalized by reviewer',
      data: appraisal,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAppraisal = async (req, res, next) => {
  try {
    const appraisal = await Appraisal.findByIdAndDelete(req.params.id);

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Performance appraisal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Performance appraisal removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
