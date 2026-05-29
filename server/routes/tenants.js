const express = require('express');
const router = express.Router();
const { getTenants, createTenant, updateSubscription } = require('../controllers/tenantController');
const { protect, authorize } = require('../middleware/auth');

// Secure all tenant endpoints to superadmin only
router.use(protect);
router.use(authorize('superadmin'));

router.get('/', getTenants);
router.post('/', createTenant);
router.put('/:id/subscription', updateSubscription);

module.exports = router;
