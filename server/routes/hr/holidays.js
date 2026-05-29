const express = require('express');
const router = express.Router();
const { 
  createHoliday, getHolidays, getHoliday, updateHoliday, deleteHoliday 
} = require('../../controllers/hr/holidayController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

router.use(protect);

router.post('/', hrAccess, createHoliday);
router.get('/', getHolidays); // All staff can see calendar holidays
router.get('/:id', getHoliday);
router.put('/:id', hrAccess, updateHoliday);
router.delete('/:id', hrAccess, deleteHoliday);

module.exports = router;
