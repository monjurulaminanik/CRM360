const express = require('express');
const router = express.Router();
const { 
  createDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment 
} = require('../../controllers/hr/departmentController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

router.use(protect);

router.post('/', hrAccess, createDepartment);
router.get('/', hrAccess, getDepartments);
router.get('/:id', hrAccess, getDepartment);
router.put('/:id', hrAccess, updateDepartment);
router.delete('/:id', hrAccess, deleteDepartment);

module.exports = router;
