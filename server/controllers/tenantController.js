const Tenant = require('../models/Tenant');
const User = require('../models/User');

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private/Superadmin
const getTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find({});
    res.json({ success: true, count: tenants.length, data: tenants });
  } catch (err) {
    next(err);
  }
};

// @desc    Create/Provision a new tenant
// @route   POST /api/tenants
// @access  Private/Superadmin
const createTenant = async (req, res, next) => {
  try {
    const { name, slug, subscriptionPlan, expiresAt, adminName, adminEmail, adminPassword } = req.body;

    // Check if slug is already taken
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      return res.status(400).json({ success: false, message: `Slug '${slug}' is already taken` });
    }

    // Create Tenant
    const tenant = await Tenant.create({
      name,
      slug,
      subscriptionPlan: subscriptionPlan || 'basic',
      subscriptionStatus: 'active',
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    });

    // Create default tenant admin user
    const adminUser = await User.create({
      name: adminName || `${name} Admin`,
      email: adminEmail,
      password: adminPassword || 'Admin@D360',
      role: 'admin',
      tenantId: tenant._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Workspace and Tenant Admin provisioned successfully!',
      data: {
        tenant,
        adminUser: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update tenant subscription
// @route   PUT /api/tenants/:id/subscription
// @access  Private/Superadmin
const updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionPlan, subscriptionStatus, expiresAt } = req.body;

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (subscriptionPlan) tenant.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) tenant.subscriptionStatus = subscriptionStatus;
    if (expiresAt) tenant.expiresAt = new Date(expiresAt);

    await tenant.save();

    res.json({ success: true, message: 'Subscription status updated!', data: tenant });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTenants,
  createTenant,
  updateSubscription,
};
