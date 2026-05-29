const express = require('express');
const router = express.Router();
const { getCompetitorAds } = require('../controllers/competitorController');
const { protect } = require('../middleware/auth');

// Protect all competitor intelligence routes
router.use(protect);

// GET /api/competitors/ads?page_id=XXX
router.get('/ads', getCompetitorAds);

module.exports = router;
