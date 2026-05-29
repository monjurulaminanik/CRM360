const Payroll = require('../../models/hr/Payroll');
const Employee = require('../../models/hr/Employee');
const Attendance = require('../../models/hr/Attendance');
const SalaryStructure = require('../../models/hr/SalaryStructure');
const calculateWorkingDays = require('../../utils/hr/calculateWorkingDays');
const generatePayslipPDF = require('../../utils/hr/generatePayslipPDF');

// Generate draft payroll record for employee for a given month and year
exports.generatePayroll = async (req, res, next) => {
  try {
    const { employee: employeeId, month, year, bonus = 0, taxDeducted = 0, overtime = 0 } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: 'Employee, month, and year are required.' });
    }

    const employee = await Employee.findById(employeeId).populate('shift');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const structure = await SalaryStructure.findOne({ employee: employeeId });
    if (!structure) {
      return res.status(400).json({ 
        success: false, 
        message: 'No salary structure defined for this employee. Please configure salary details first.' 
      });
    }

    // Verify if payroll already exists
    const existing = await Payroll.findOne({ employee: employeeId, month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Payroll record already exists for this period.' });
    }

    // Calculate dates
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59);

    // Calculate corporate calendar working days (excluding weekends/holidays)
    const workingDays = await calculateWorkingDays(firstDay, lastDay, employee.shift);

    // Retrieve daily attendance records
    const attendanceLogs = await Attendance.find({
      employee: employeeId,
      date: { $gte: firstDay, $lte: lastDay },
    });

    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;

    attendanceLogs.forEach((log) => {
      if (log.status === 'present' || log.status === 'late') {
        presentDays++;
      } else if (log.status === 'absent') {
        absentDays++;
      } else if (log.status === 'on-leave') {
        leaveDays++;
      } else if (log.status === 'half-day') {
        presentDays += 0.5;
        absentDays += 0.5;
      }
    });

    // Default missing days in attendance logs as absent
    const totalLogged = presentDays + absentDays + leaveDays;
    if (totalLogged < workingDays) {
      absentDays += (workingDays - totalLogged);
    }

    // Calculate allowances and deductions totals
    const basicSalary = structure.basicSalary;
    let totalAllowances = 0;
    let totalDeductions = 0;

    structure.allowances.forEach((al) => {
      totalAllowances += al.type === 'fixed' ? al.value : (al.value / 100) * basicSalary;
    });

    structure.deductions.forEach((de) => {
      totalDeductions += de.type === 'fixed' ? de.value : (de.value / 100) * basicSalary;
    });

    // Custom overtime hourly rate calculation (assuming 176 standard working hours per month)
    const hourlyRate = (basicSalary / 176);
    const overtimePay = Number((overtime * hourlyRate * 1.5).toFixed(2)); // 1.5x overtime multiplier

    const grossSalary = basicSalary + totalAllowances + bonus + overtimePay;
    const netSalary = Math.max(0, grossSalary - totalDeductions - taxDeducted);

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      workingDays,
      presentDays,
      absentDays,
      leaveDays,
      basicSalary,
      totalAllowances,
      totalDeductions: totalDeductions,
      overtime,
      bonus,
      taxDeducted,
      grossSalary,
      netSalary,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Monthly payroll draft sheet generated successfully.',
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// Process / Pay payroll
exports.processPayroll = async (req, res, next) => {
  try {
    const { status, paymentMethod, transactionRef } = req.body;

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    if (status) payroll.status = status;
    if (paymentMethod) payroll.paymentMethod = paymentMethod;
    if (transactionRef) payroll.transactionRef = transactionRef;
    if (status === 'paid') payroll.paymentDate = new Date();

    await payroll.save();

    res.status(200).json({
      success: true,
      message: `Payroll status updated to ${payroll.status}.`,
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

// List payroll records
exports.listPayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year, status } = req.query;

    const query = {};
    if (req.employee) {
      query.employee = req.employee._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status) query.status = status;

    const records = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId email designation')
      .sort('-year -month');

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// Export Payslip PDF Stream
exports.getPayslipPDF = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll sheet record not found.' });
    }

    // If standard user, verify authorization
    if (req.employee && req.employee._id.toString() !== payroll.employee._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized to download other staff payslips.' });
    }

    // Call PDF generator helper
    const pdfBuffer = await generatePayslipPDF(payroll);

    // Send PDF buffer directly as attachment stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payslip-${payroll.employee.employeeId}-${payroll.month}-${payroll.year}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
