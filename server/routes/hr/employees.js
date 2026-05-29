const express = require('express');
const router = express.Router();
const { 
  createEmployee, getEmployees, getEmployee, updateEmployee, deleteEmployee 
} = require('../../controllers/hr/employeeController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

// Protect all routes
router.use(protect);

// Admin/HR specific endpoints
router.post('/', hrAccess, createEmployee);
router.get('/', hrAccess, getEmployees);
router.get('/:id', hrAccess, getEmployee);
router.put('/:id', hrAccess, updateEmployee);
router.delete('/:id', hrAccess, deleteEmployee);

module.exports = router;
