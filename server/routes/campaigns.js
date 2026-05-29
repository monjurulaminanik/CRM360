const express = require('express');
const router = express.Router();
const { getCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',     getCampaigns);
router.get('/:id',  getCampaign);
router.post('/',    createCampaign);
router.put('/:id',  updateCampaign);
router.delete('/:id', deleteCampaign);

module.exports = router;
