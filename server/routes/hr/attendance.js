const express = require('express');
const router = express.Router();
const { checkIn, checkOut, listAttendance } = require('../../controllers/hr/attendanceController');
const { protect } = require('../../middleware/auth');
const ownDataOnly = require('../../middleware/ownDataOnly');

router.use(protect);

// Users with standard access can only check in/out themselves, HR/Admin can check in anyone
router.post('/check-in', ownDataOnly, checkIn);
router.post('/check-out', ownDataOnly, checkOut);
router.get('/', ownDataOnly, listAttendance);

module.exports = router;
