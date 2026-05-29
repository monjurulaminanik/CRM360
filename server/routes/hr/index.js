const express = require('express');
const router = express.Router();

const employeeRoutes = require('./employees');
const departmentRoutes = require('./departments');
const designationRoutes = require('./designations');
const attendanceRoutes = require('./attendance');
const leaveRoutes = require('./leaves');
const leaveTypeRoutes = require('./leaveTypes');
const holidayRoutes = require('./holidays');
const shiftRoutes = require('./shifts');
const salaryStructureRoutes = require('./salaryStructures');
const payrollRoutes = require('./payroll');
const appraisalRoutes = require('./appraisals');
const dashboardRoutes = require('./dashboard');

// Bind all sub-routes
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/designations', designationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/leave-types', leaveTypeRoutes);
router.use('/holidays', holidayRoutes);
router.use('/shifts', shiftRoutes);
router.use('/salary-structures', salaryStructureRoutes);
router.use('/payroll', payrollRoutes);
router.use('/appraisals', appraisalRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
