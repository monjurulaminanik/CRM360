require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

async function ensureTenantAndAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  let tenant = await Tenant.findOne({ slug: 'dawatit' });
  if (!tenant) {
    tenant = await Tenant.create({
      name: 'Dawat IT',
      slug: 'dawatit',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      expiresAt: new Date('2030-12-31'),
    });
    console.log('Tenant created:', tenant._id.toString());
  } else {
    console.log('Tenant exists:', tenant._id.toString());
  }

  const email = 'anik@dawatit.com';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: 'Monjurul Amin Anik',
      email,
      password: 'Admin@D360',
      role: 'admin',
      isActive: true,
      tenantId: tenant._id,
    });
    console.log('Admin user created');
  } else {
    user.tenantId = tenant._id;
    await user.save();
    console.log('Admin user updated with tenantId');
  }

  // Optional demo accounts used on login page
  const demos = [
    { name: 'Super Admin', email: 'superadmin@d360.com', password: 'Super@D360', role: 'superadmin' },
    { name: 'Demo Client', email: 'client@d360.com', password: 'Client@D360', role: 'client' },
    { name: 'Demo Employee', email: 'employee@d360.com', password: 'Employee@D360', role: 'employee' },
  ];

  for (const d of demos) {
    const exists = await User.findOne({ email: d.email });
    if (!exists) {
      await User.create({ ...d, isActive: true, tenantId: tenant._id });
      console.log('Created:', d.email);
    } else if (!exists.tenantId) {
      exists.tenantId = tenant._id;
      await exists.save();
      console.log('Linked tenant:', d.email);
    }
  }

  console.log('Done. Login: anik@dawatit.com / Admin@D360');
  await mongoose.disconnect();
}

ensureTenantAndAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
