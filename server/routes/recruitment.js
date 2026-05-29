const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob, getCandidates, addCandidate, updateCandidateStatus, deleteCandidate } = require('../controllers/recruitmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

router.get('/candidates', getCandidates);
router.post('/candidates', addCandidate);
router.put('/candidates/:id/status', updateCandidateStatus);
router.delete('/candidates/:id', deleteCandidate);

module.exports = router;
