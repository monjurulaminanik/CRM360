const Employee = require('../../models/hr/Employee');
const generateEmployeeId = require('../../utils/hr/generateEmployeeId');

// Create a new employee record
exports.createEmployee = async (req, res, next) => {
  try {
    const employeeId = await generateEmployeeId();
    
    const employeeData = {
      ...req.body,
      employeeId,
      createdBy: req.user._id,
    };

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      success: true,
      message: 'Employee record created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all employees with advanced sorting, pagination, and searching
exports.getEmployees = async (req, res, next) => {
  try {
    const { department, status, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};

    if (department) {
      query.department = department;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('department')
      .populate('reportingTo')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve single employee by ID
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('reportingTo');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Update an employee profile
exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// Delete employee record
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Employee record deleted permanently',
    });
  } catch (error) {
    next(error);
  }
};
