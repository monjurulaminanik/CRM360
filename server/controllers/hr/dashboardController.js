const Employee = require('../../models/hr/Employee');
const Leave = require('../../models/hr/Leave');
const Attendance = require('../../models/hr/Attendance');
const Shift = require('../../models/hr/Shift');
const Department = require('../../models/hr/Department');

// Aggregate core stats for the HR dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Total active staff members
    const totalEmployees = await Employee.countDocuments({ status: 'active' });

    // 2. Active leaves today
    const onLeaveToday = await Leave.countDocuments({
      status: 'approved',
      startDate: { $lte: endOfToday },
      endDate: { $gte: today },
    });

    // 3. Late arrivals today
    const lateArrivalsToday = await Attendance.countDocuments({
      date: today,
      status: 'late',
    });

    // 4. Present today
    const presentToday = await Attendance.countDocuments({
      date: today,
      status: { $in: ['present', 'late', 'half-day'] },
    });

    // 5. Birthdays this month
    const currentMonth = today.getMonth() + 1; // 1-indexed (Jan is 1)
    
    // Find all active employees
    const allEmployees = await Employee.find({ status: 'active' }, { firstName: 1, lastName: 1, dateOfBirth: 1, employeeId: 1, profilePhoto: 1 });
    const birthdaysThisMonth = allEmployees.filter((emp) => {
      if (!emp.dateOfBirth) return false;
      const dobMonth = new Date(emp.dateOfBirth).getMonth() + 1;
      return dobMonth === currentMonth;
    }).map(emp => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      profilePhoto: emp.profilePhoto,
      day: new Date(emp.dateOfBirth).getDate()
    }));

    // Sort birthdays by day of month
    birthdaysThisMonth.sort((a, b) => a.day - b.day);

    // 6. Shift status totals
    const activeShiftsCount = await Shift.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        onLeaveToday,
        lateArrivalsToday,
        presentToday,
        absentToday: Math.max(0, totalEmployees - presentToday - onLeaveToday),
        birthdaysThisMonth,
        activeShiftsCount,
        totalDepartments,
      },
    });
  } catch (error) {
    next(error);
  }
};
