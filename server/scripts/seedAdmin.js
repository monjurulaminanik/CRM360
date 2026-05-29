require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const existing = await User.findOne({ email: 'anik@dawatit.com' });
  if (existing) {
    console.log('Admin user already exists — skipping.');
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: 'Monjurul Amin Anik',
    email: 'anik@dawatit.com',
    password: 'Admin@D360',
    role: 'admin',
    isActive: true,
  });

  console.log('Admin user created successfully.');
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
