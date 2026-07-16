const Tenant = require('../models/Tenant');
const User = require('../models/User');

/**
 * Ensure req.user has a tenantId. Creates default Dawat IT tenant if missing.
 */
async function ensureUserTenant(req, res, next) {
  try {
    if (req.user?.tenantId) return next();

    let tenant = await Tenant.findOne({ slug: 'dawatit' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'Dawat IT',
        slug: 'dawatit',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
        expiresAt: new Date('2030-12-31'),
      });
    }

    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { tenantId: tenant._id });
      req.user.tenantId = tenant._id;
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = ensureUserTenant;
