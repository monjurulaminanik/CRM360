const express = require('express');
const router = express.Router();
const { 
  createDesignation, getDesignations, getDesignation, updateDesignation, deleteDesignation 
} = require('../../controllers/hr/designationController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');

router.use(protect);

router.post('/', hrAccess, createDesignation);
router.get('/', hrAccess, getDesignations);
router.get('/:id', hrAccess, getDesignation);
router.put('/:id', hrAccess, updateDesignation);
router.delete('/:id', hrAccess, deleteDesignation);

module.exports = router;
