const express = require('express');
const router = express.Router();
const { 
  generatePayroll, processPayroll, listPayroll, getPayslipPDF 
} = require('../../controllers/hr/payrollController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');
const ownDataOnly = require('../../middleware/ownDataOnly');

router.use(protect);

// Admin / HR actions for payroll calculation
router.post('/generate', hrAccess, generatePayroll);
router.put('/:id/process', hrAccess, processPayroll);

// All staff can list their own payroll records (HR/Admin lists all)
router.get('/', ownDataOnly, listPayroll);

// Export payslip PDF (ownDataOnly validates that employees only download their own payslip)
router.get('/:id/payslip', ownDataOnly, getPayslipPDF);

module.exports = router;
