const express = require('express');
const router = express.Router();
const { 
  createSalaryStructure, getSalaryStructures, getSalaryStructure, updateSalaryStructure, deleteSalaryStructure 
} = require('../../controllers/hr/salaryStructureController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

router.use(protect);

router.post('/', hrAccess, createSalaryStructure);
router.get('/', hrAccess, getSalaryStructures);
router.get('/:employeeId/employee', hrAccess, getSalaryStructure);
router.get('/:id', hrAccess, getSalaryStructure);
router.put('/:id', hrAccess, updateSalaryStructure);
router.delete('/:id', hrAccess, deleteSalaryStructure);

module.exports = router;
