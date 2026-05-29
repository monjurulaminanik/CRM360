const Designation = require('../../models/hr/Designation');

exports.createDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Designation created successfully',
      data: designation,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDesignations = async (req, res, next) => {
  try {
    const designations = await Designation.find().populate('department');
    res.status(200).json({
      success: true,
      data: designations,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findById(req.params.id).populate('department');
    
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    
    res.status(200).json({
      success: true,
      data: designation,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Designation updated successfully',
      data: designation,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Designation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
