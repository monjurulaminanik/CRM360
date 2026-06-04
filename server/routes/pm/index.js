const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { projectAccess, projectEditAccess } = require('../../middleware/pm/projectAccess');
const { phaseTransitionValidator } = require('../../middleware/pm/phaseTransitionValidator');

// Controllers
const projectCtrl = require('../../controllers/pm/projectController');
const charterCtrl = require('../../controllers/pm/charterController');
const scheduleCtrl = require('../../controllers/pm/scheduleController');
const taskCtrl = require('../../controllers/pm/taskController');
const budgetCtrl = require('../../controllers/pm/budgetController');
const resourceCtrl = require('../../controllers/pm/resourceController');
const qualityCtrl = require('../../controllers/pm/qualityController');
const raiddCtrl = require('../../controllers/pm/raiddController');
const statusReportCtrl = require('../../controllers/pm/statusReportController');
const meetingCtrl = require('../../controllers/pm/meetingController');
const diaryCtrl = require('../../controllers/pm/diaryController');
const changeRequestCtrl = require('../../controllers/pm/changeRequestController');
const milestoneCtrl = require('../../controllers/pm/milestoneController');
const documentCtrl = require('../../controllers/pm/documentController');
const vendorCtrl = require('../../controllers/pm/vendorController');
const closureCtrl = require('../../controllers/pm/closureController');
const dashboardCtrl = require('../../controllers/pm/dashboardController');
const lessonsCtrl = require('../../controllers/pm/lessonsLibraryController');

// All PM routes require authentication
router.use(protect);

// ═══════════════════════════════════════════════════════════
// CROSS-PROJECT ROUTES (no project ID needed)
// ═══════════════════════════════════════════════════════════

// Portfolio Dashboard
router.get('/dashboard', dashboardCtrl.getPortfolioDashboard);

// Lessons Library (cross-project)
router.get('/lessons', lessonsCtrl.searchLessons);
router.get('/lessons/categories', lessonsCtrl.getLessonCategories);

// Resource Availability (cross-project)
router.get('/resources/availability', resourceCtrl.getAvailability);

// ═══════════════════════════════════════════════════════════
// PROJECT MASTER CRUD
// ═══════════════════════════════════════════════════════════

router.get('/projects', projectCtrl.getProjects);
router.post('/projects', projectCtrl.createProject);
router.get('/projects/:id', projectAccess, projectCtrl.getProject);
router.put('/projects/:id', projectAccess, projectCtrl.updateProject);
router.delete('/projects/:id', projectAccess, projectCtrl.deleteProject);
router.post('/projects/:id/move-phase', projectAccess, phaseTransitionValidator, projectCtrl.movePhase);
router.get('/projects/:id/dashboard', projectAccess, projectCtrl.getProjectDashboard);
router.post('/projects/:id/clone', projectAccess, projectCtrl.cloneProject);

// ═══════════════════════════════════════════════════════════
// CHARTER (Initiation)
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/charter', projectAccess, charterCtrl.getCharter);
router.put('/projects/:id/charter', projectAccess, charterCtrl.updateCharter);
router.post('/projects/:id/charter/submit-for-approval', projectAccess, charterCtrl.submitCharterForApproval);
router.post('/projects/:id/charter/approve', projectAccess, charterCtrl.approveCharter);
router.get('/projects/:id/charter/pdf', projectAccess, charterCtrl.getCharterPDF);

// ═══════════════════════════════════════════════════════════
// SCHEDULE & TASKS (Planning + Execution)
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/schedule', projectAccess, scheduleCtrl.getSchedule);
router.post('/projects/:id/schedule/baseline', projectAccess, scheduleCtrl.lockBaseline);
router.get('/projects/:id/critical-path', projectAccess, scheduleCtrl.getCriticalPath);
router.get('/projects/:id/gantt-data', projectAccess, scheduleCtrl.getGanttData);

router.get('/projects/:id/tasks', projectAccess, taskCtrl.getTasks);
router.post('/projects/:id/tasks', projectAccess, taskCtrl.createTask);
router.put('/tasks/:id', taskCtrl.updateTask);
router.delete('/tasks/:id', taskCtrl.deleteTask);
router.post('/tasks/:id/dependencies', taskCtrl.addDependency);

// ═══════════════════════════════════════════════════════════
// BUDGET & EXPENSES
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/budget', projectAccess, budgetCtrl.getBudget);
router.put('/projects/:id/budget', projectAccess, budgetCtrl.updateBudget);
router.get('/projects/:id/budget/evm', projectAccess, budgetCtrl.getEVM);
router.post('/projects/:id/expenses', projectAccess, budgetCtrl.createExpense);
router.get('/projects/:id/expenses', projectAccess, budgetCtrl.getExpenses);

// ═══════════════════════════════════════════════════════════
// RESOURCES & RACI
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/resources', projectAccess, resourceCtrl.getResources);
router.post('/projects/:id/resources', projectAccess, resourceCtrl.addResource);
router.put('/resources/:id', resourceCtrl.updateResource);
router.get('/projects/:id/raci', projectAccess, resourceCtrl.getRACI);
router.put('/projects/:id/raci', projectAccess, resourceCtrl.updateRACI);

// ═══════════════════════════════════════════════════════════
// QUALITY
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/quality', projectAccess, qualityCtrl.getQuality);
router.put('/projects/:id/quality', projectAccess, qualityCtrl.updateQuality);
router.post('/projects/:id/quality/checks', projectAccess, qualityCtrl.addQCCheck);
router.post('/projects/:id/quality/defects', projectAccess, qualityCtrl.addDefect);

// ═══════════════════════════════════════════════════════════
// RAIDD LOG
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/raidd', projectAccess, raiddCtrl.getRAIDD);
router.post('/projects/:id/raidd', projectAccess, raiddCtrl.addRAIDDEntry);
router.put('/raidd/:entryId', raiddCtrl.updateRAIDDEntry);
router.delete('/raidd/:entryId', raiddCtrl.deleteRAIDDEntry);

// ═══════════════════════════════════════════════════════════
// STATUS REPORTS
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/status-reports', projectAccess, statusReportCtrl.getStatusReports);
router.post('/projects/:id/status-reports', projectAccess, statusReportCtrl.createStatusReport);
router.get('/status-reports/:id/pdf', statusReportCtrl.getStatusReportPDF);

// ═══════════════════════════════════════════════════════════
// MEETINGS
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/meetings', projectAccess, meetingCtrl.getMeetings);
router.post('/projects/:id/meetings', projectAccess, meetingCtrl.createMeeting);
router.put('/meetings/:id', meetingCtrl.updateMeeting);
router.post('/meetings/:id/minutes', meetingCtrl.addMinutes);

// ═══════════════════════════════════════════════════════════
// DIARY
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/diary', projectAccess, diaryCtrl.getDiaryEntries);
router.post('/projects/:id/diary', projectAccess, diaryCtrl.createDiaryEntry);
router.put('/diary/:id', diaryCtrl.updateDiaryEntry);

// ═══════════════════════════════════════════════════════════
// CHANGE REQUESTS
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/changes', projectAccess, changeRequestCtrl.getChangeRequests);
router.post('/projects/:id/changes', projectAccess, changeRequestCtrl.createChangeRequest);
router.put('/changes/:id', changeRequestCtrl.updateChangeRequest);
router.post('/changes/:id/review', changeRequestCtrl.addReview);
router.post('/changes/:id/decision', changeRequestCtrl.makeDecision);

// ═══════════════════════════════════════════════════════════
// MILESTONES
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/milestones', projectAccess, milestoneCtrl.getMilestones);
router.post('/projects/:id/milestones', projectAccess, milestoneCtrl.createMilestone);
router.post('/milestones/:id/achieve', milestoneCtrl.achieveMilestone);

// ═══════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/documents', projectAccess, documentCtrl.getDocuments);
router.post('/projects/:id/documents', projectAccess, documentCtrl.uploadDocument);

// ═══════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/vendors', projectAccess, vendorCtrl.getVendors);
router.post('/projects/:id/vendors', projectAccess, vendorCtrl.createVendor);
router.put('/vendors/:id', vendorCtrl.updateVendor);

// ═══════════════════════════════════════════════════════════
// CLOSURE
// ═══════════════════════════════════════════════════════════

router.get('/projects/:id/closure', projectAccess, closureCtrl.getClosure);
router.post('/projects/:id/closure/initiate', projectAccess, closureCtrl.initiateClosure);
router.post('/projects/:id/closure/sign-off', projectAccess, closureCtrl.signOff);
router.post('/projects/:id/closure/lessons-learned', projectAccess, closureCtrl.captureeLessonsLearned);
router.post('/projects/:id/closure/finalize', projectAccess, closureCtrl.finalizeClosure);
router.get('/projects/:id/closure/final-report-pdf', projectAccess, closureCtrl.getFinalReportPDF);

module.exports = router;
