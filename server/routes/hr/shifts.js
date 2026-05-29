const express = require('express');
const router = express.Router();
const { 
  createShift, getShifts, getShift, updateShift, deleteShift 
} = require('../../controllers/hr/shiftController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

router.use(protect);

router.post('/', hrAccess, createShift);
router.get('/', hrAccess, getShifts);
router.get('/:id', hrAccess, getShift);
router.put('/:id', hrAccess, updateShift);
router.delete('/:id', hrAccess, deleteShift);

module.exports = router;
