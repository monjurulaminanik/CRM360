const express = require('express');
const router = express.Router();
const { 
  applyLeave, approveLeave, rejectLeave, listLeaves, getLeaveBalances 
} = require('../../controllers/hr/leaveController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');
const ownDataOnly = require('../../middleware/ownDataOnly');

router.use(protect);

// Apply for leave (standard employees can only apply for themselves)
router.post('/apply', ownDataOnly, applyLeave);

// Approve or reject leaves (HR/Admin access only)
router.put('/:id/approve', hrAccess, approveLeave);
router.put('/:id/reject', hrAccess, rejectLeave);

// List leaves (standard employees only see their own)
router.get('/', ownDataOnly, listLeaves);

// Retrieve leave balances (standard employees only see their own)
router.get('/balance/:employeeId', ownDataOnly, getLeaveBalances);
router.get('/balance', ownDataOnly, getLeaveBalances);

module.exports = router;
