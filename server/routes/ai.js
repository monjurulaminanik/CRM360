const express = require('express');
const router = express.Router();
const { analyzeIdea } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Protected route
router.post('/analyze-idea', protect, analyzeIdea);

module.exports = router;
