const express = require('express');
const router = express.Router();
const { 
  createAppraisal, getAppraisals, getAppraisal, updateAppraisal, submitAppraisal, reviewAppraisal, deleteAppraisal 
} = require('../../controllers/hr/appraisalController');
const { protect } = require('../../middleware/auth');
const hrAccess = require('../../middleware/hrAccess');
const ownDataOnly = require('../../middleware/ownDataOnly');

router.use(protect);

router.post('/', hrAccess, createAppraisal);
router.get('/', ownDataOnly, getAppraisals); // Standard employees can view their own appraisals, HR sees all
router.get('/:id', ownDataOnly, getAppraisal);
router.put('/:id', hrAccess, updateAppraisal);
router.put('/:id/submit', ownDataOnly, submitAppraisal); // Employee self-submits or reviewer submits
router.put('/:id/review', hrAccess, reviewAppraisal); // Reviewer scores and finalizes
router.delete('/:id', hrAccess, deleteAppraisal);

module.exports = router;
