const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject, logTime, getAllTimeLogs } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getProjects);
router.get('/time/all', getAllTimeLogs);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/time', logTime);

module.exports = router;
