const SalaryStructure = require('../../models/hr/SalaryStructure');

exports.createSalaryStructure = async (req, res, next) => {
  try {
    const salaryStructure = await SalaryStructure.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Salary structure defined successfully',
      data: salaryStructure,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalaryStructures = async (req, res, next) => {
  try {
    const salaryStructures = await SalaryStructure.find().populate('employee', 'firstName lastName employeeId email');
    res.status(200).json({
      success: true,
      data: salaryStructures,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalaryStructure = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId || req.params.id;
    // Can look up either by record ID or by employee ID
    let salaryStructure = await SalaryStructure.findOne({ employee: employeeId }).populate('employee');
    
    if (!salaryStructure) {
      salaryStructure = await SalaryStructure.findById(req.params.id).populate('employee');
    }

    if (!salaryStructure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }

    res.status(200).json({
      success: true,
      data: salaryStructure,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSalaryStructure = async (req, res, next) => {
  try {
    const salaryStructure = await SalaryStructure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!salaryStructure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Salary structure updated successfully',
      data: salaryStructure,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSalaryStructure = async (req, res, next) => {
  try {
    const salaryStructure = await SalaryStructure.findByIdAndDelete(req.params.id);
    if (!salaryStructure) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Salary structure removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
