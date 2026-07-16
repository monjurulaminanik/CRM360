require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Models
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Client = require('../models/Client');
const Lead = require('../models/Lead');
const Project = require('../models/Project');
const ProjectCharter = require('../models/pm/ProjectCharter');
const ProjectBudget = require('../models/pm/ProjectBudget');
const ProjectMilestone = require('../models/pm/ProjectMilestone');
const ProjectTask = require('../models/pm/ProjectTask');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');

async function seedAwesomeData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Get Tenant and Admin User
    const tenant = await Tenant.findOne({ slug: 'dawat-it' });
    if (!tenant) throw new Error('Tenant not found. Run fix script first.');

    const admin = await User.findOne({ email: 'anik@dawatit.com' });
    if (!admin) throw new Error('Admin user not found. Run seedAdmin first.');

    // 2. Clear existing dummy data (safely)
    console.log('Clearing old data...');
    await Client.deleteMany({ tenantId: tenant._id });
    await Lead.deleteMany({ tenantId: tenant._id });
    await Project.deleteMany({ tenantId: tenant._id });
    await ProjectCharter.deleteMany({ tenantId: tenant._id });
    await ProjectBudget.deleteMany({ tenantId: tenant._id });
    await ProjectMilestone.deleteMany({ tenantId: tenant._id });
    await ProjectTask.deleteMany({ tenantId: tenant._id });
    await Invoice.deleteMany({ tenantId: tenant._id });
    await Expense.deleteMany({ tenantId: tenant._id });

    // 3. Create Clients
    console.log('Creating Clients...');
    const client1 = await Client.create({
      tenantId: tenant._id,
      company: 'PixelTech Innovations',
      name: 'Sarah Connor',
      email: 'sarah@pixeltech.com',
      phone: '+8801700000001',
      status: 'active',
      createdBy: admin._id,
    });

    const client2 = await Client.create({
      tenantId: tenant._id,
      company: 'GreenLeaf Organic',
      name: 'John Doe',
      email: 'john@greenleaf.com',
      phone: '+8801700000002',
      status: 'active',
      createdBy: admin._id,
    });

    const client3 = await Client.create({
      tenantId: tenant._id,
      company: 'Apex Real Estate',
      name: 'Mike Ross',
      email: 'mike@apexrealty.com',
      phone: '+8801700000003',
      status: 'inactive',
      createdBy: admin._id,
    });

    // 4. Create Leads
    console.log('Creating Leads...');
    await Lead.create({
      tenantId: tenant._id,
      name: 'Emma Watson',
      company: 'Magic Books Ltd',
      email: 'emma@magicbooks.com',
      phone: '+8801700000004',
      status: 'new',
      source: 'social_media',
      value: 50000,
      createdBy: admin._id,
    });
    
    await Lead.create({
      tenantId: tenant._id,
      name: 'Bruce Wayne',
      company: 'Wayne Enterprises',
      email: 'bruce@wayne.com',
      phone: '+8801700000005',
      status: 'contacted',
      source: 'website',
      value: 150000,
      createdBy: admin._id,
    });

    // 5. Create Projects
    console.log('Creating Projects & PM Data...');
    
    // Project 1: Initiation Phase
    const p1 = await Project.create({
      tenantId: tenant._id,
      name: 'GreenLeaf E-Commerce Revamp',
      client: client2._id,
      projectType: 'development',
      currentPhase: 'initiation',
      overallStatus: 'not-started',
      estimatedBudget: 120000,
      createdBy: admin._id,
      projectManager: admin._id,
      startDate: new Date(),
    });
    await ProjectCharter.create({
      project: p1._id,
      tenantId: tenant._id,
      objectives: [{ description: 'Build a high-converting Shopify store for organic products.' }],
      inScope: ['20% increase in conversion rate.'],
      charterStatus: 'draft',
    });

    // Project 2: Planning Phase
    const p2 = await Project.create({
      tenantId: tenant._id,
      name: 'PixelTech Marketing Automation',
      client: client1._id,
      projectType: 'marketing',
      currentPhase: 'planning',
      overallStatus: 'in-progress',
      estimatedBudget: 80000,
      createdBy: admin._id,
      projectManager: admin._id,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    await ProjectCharter.create({
      project: p2._id,
      tenantId: tenant._id,
      charterStatus: 'approved',
      objectives: [{ description: 'Automate lead nurturing using HubSpot.' }],
    });
    await ProjectBudget.create({
      project: p2._id,
      tenantId: tenant._id,
      baselineBudget: 80000,
      isBaselined: true,
      createdBy: admin._id,
    });

    // Project 3: Execution Phase
    const p3 = await Project.create({
      tenantId: tenant._id,
      name: 'Apex Realty Mobile App',
      client: client3._id,
      projectType: 'mobile-app',
      currentPhase: 'execution',
      overallStatus: 'in-progress',
      estimatedBudget: 350000,
      actualSpent: 120000,
      createdBy: admin._id,
      projectManager: admin._id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      targetEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      progressPercent: 45,
    });
    await ProjectBudget.create({
      project: p3._id,
      tenantId: tenant._id,
      baselineBudget: 350000,
      actualCost: 120000,
      isBaselined: true,
      createdBy: admin._id,
    });
    await ProjectMilestone.create({
      project: p3._id,
      tenantId: tenant._id,
      name: 'UI/UX Design Sign-off',
      paymentAmount: 50000,
      paymentTrigger: true,
      targetDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'achieved',
      createdBy: admin._id,
    });
    await ProjectMilestone.create({
      project: p3._id,
      tenantId: tenant._id,
      name: 'Backend API Completion',
      paymentAmount: 100000,
      paymentTrigger: true,
      targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdBy: admin._id,
    });
    await ProjectTask.create({
      project: p3._id,
      tenantId: tenant._id,
      name: 'Design Login Screen',
      status: 'done',
      assignedTo: [admin._id],
      createdBy: admin._id,
    });
    await ProjectTask.create({
      project: p3._id,
      tenantId: tenant._id,
      name: 'Develop User Authentication APIs',
      status: 'in-progress',
      priority: 'high',
      assignedTo: [admin._id],
      createdBy: admin._id,
    });

    // No Finances for now

    console.log('✅ Awesome dummy data has been successfully injected into the database!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedAwesomeData();
