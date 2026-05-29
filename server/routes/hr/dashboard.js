const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../../controllers/hr/dashboardController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

router.use(protect);

// Only administrators and HR staff can retrieve dashboard statistics
router.get('/', hrAccess, getDashboardStats);

module.exports = router;
