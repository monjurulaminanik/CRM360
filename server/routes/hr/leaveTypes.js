const express = require('express');
const router = express.Router();
const { 
  createLeaveType, getLeaveTypes, getLeaveType, updateLeaveType, deleteLeaveType 
} = require('../../controllers/hr/leaveTypeController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

router.use(protect);

router.post('/', hrAccess, createLeaveType);
router.get('/', getLeaveTypes); // Standard employees can read leave types rules
router.get('/:id', getLeaveType);
router.put('/:id', hrAccess, updateLeaveType);
router.delete('/:id', hrAccess, deleteLeaveType);

module.exports = router;
