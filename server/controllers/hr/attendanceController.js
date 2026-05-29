const Employee = require('../../models/hr/Employee');
const Attendance = require('../../models/hr/Attendance');
const attendanceStatusCalculator = require('../../utils/hr/attendanceStatusCalculator');

// Check-in action for daily attendance logging
exports.checkIn = async (req, res, next) => {
  try {
    // If ownDataOnly resolved req.employee, use it. Otherwise expect explicit employee ID in body.
    let employeeId = req.body.employee;
    if (!employeeId && req.employee) {
      employeeId = req.employee._id;
    }

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee reference is required for check-in.' });
    }

    const employee = await Employee.findById(employeeId).populate('shift');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verify if check-in record already exists for this date
    const existingRecord = await Attendance.findOne({ employee: employeeId, date: today });
    if (existingRecord) {
      return res.status(400).json({ success: false, message: 'Already checked in for today.' });
    }

    const checkInTime = new Date();
    const status = attendanceStatusCalculator(checkInTime, today, employee.shift);

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkIn: checkInTime,
      checkInIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
      checkInLocation: req.body.location, // expects { lat, lng }
      status,
      shift: employee.shift ? employee.shift._id : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Check-in processed successfully.',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Check-out action for ending the daily shift
exports.checkOut = async (req, res, next) => {
  try {
    let employeeId = req.body.employee;
    if (!employeeId && req.employee) {
      employeeId = req.employee._id;
    }

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee reference is required for check-out.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No check-in record registered for today.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Check-out already completed for today.' });
    }

    attendance.checkOut = new Date();
    attendance.checkOutIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    attendance.checkOutLocation = req.body.location; // expects { lat, lng }
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Check-out processed successfully.',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve attendance history with filters
exports.listAttendance = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate, page = 1, limit = 30 } = req.query;

    const query = {};

    // If ownDataOnly restricts the staff, force query for their ID
    if (req.employee) {
      query.employee = req.employee._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const count = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('shift')
      .sort('-date')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      data: records,
    });
  } catch (error) {
    next(error);
  }
};
