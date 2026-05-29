const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Department = require('../models/hr/Department');
const Designation = require('../models/hr/Designation');
const LeaveType = require('../models/hr/LeaveType');
const Shift = require('../models/hr/Shift');
const Holiday = require('../models/hr/Holiday');
require('dotenv').config();

const DB_FILE = path.join(__dirname, '../data/db.json');

const seedData = async () => {
  console.log('Starting D360 HR Database Seeding...');

  // 1. Core seed structures definition
  const shifts = [
    {
      name: 'Morning Shift',
      startTime: '09:00',
      endTime: '18:00',
      breakDuration: 60,
      lateMarkAfter: 15,
      halfDayAfter: 120,
      workingDays: [1, 2, 3, 4, 5], // Mon - Fri
      status: 'active'
    },
    {
      name: 'Evening Shift',
      startTime: '14:00',
      endTime: '23:00',
      breakDuration: 60,
      lateMarkAfter: 15,
      halfDayAfter: 120,
      workingDays: [1, 2, 3, 4, 5], // Mon - Fri
      status: 'active'
    }
  ];

  const departments = [
    { name: 'Marketing', code: 'MKTG', description: 'Brand management and marketing campaigns.', status: 'active' },
    { name: 'Development', code: 'DEV', description: 'Software engineering and product development.', status: 'active' },
    { name: 'Operations', code: 'OPS', description: 'Operational workflows and business scaling.', status: 'active' }
  ];

  const designations = [
    { title: 'Junior Software Engineer', level: 'junior', description: 'Entry level software engineering role.' },
    { title: 'Mid Web Developer', level: 'mid', description: 'Experienced full stack developer.' },
    { title: 'Senior SEO Strategist', level: 'senior', description: 'Leads search engine marketing & optimization.' },
    { title: 'Tech Lead', level: 'lead', description: 'Leads software delivery and system engineering teams.' },
    { title: 'Marketing Manager', level: 'manager', description: 'Manages marketing pipeline and business development.' }
  ];

  const leaveTypes = [
    { name: 'Casual Leave', code: 'CL', color: '#3B82F6', daysAllowedPerYear: 10, isPaid: true, carryForward: false, requiresApproval: true, status: 'active' },
    { name: 'Sick Leave', code: 'SL', color: '#EF4444', daysAllowedPerYear: 14, isPaid: true, carryForward: false, requiresApproval: true, status: 'active' },
    { name: 'Annual Leave', code: 'AL', color: '#10B981', daysAllowedPerYear: 20, isPaid: true, carryForward: true, maxCarryForward: 10, requiresApproval: true, status: 'active' },
    { name: 'Maternity Leave', code: 'ML', color: '#EC4899', daysAllowedPerYear: 90, isPaid: true, carryForward: false, requiresApproval: true, status: 'active' },
    { name: 'Paternity Leave', code: 'PL', color: '#8B5CF6', daysAllowedPerYear: 7, isPaid: true, carryForward: false, requiresApproval: true, status: 'active' },
    { name: 'Unpaid Leave', code: 'UPL', color: '#6B7280', daysAllowedPerYear: 365, isPaid: false, carryForward: false, requiresApproval: true, status: 'active' }
  ];

  const holidays = [
    { name: 'Shaheed Day / Language Martyrs\' Day', date: new Date('2026-02-21'), type: 'national', description: 'International Mother Language Day.' },
    { name: 'Sheikh Mujibur Rahman Birthday', date: new Date('2026-03-17'), type: 'national', description: 'Birthday of Father of the Nation.' },
    { name: 'Independence Day of Bangladesh', date: new Date('2026-03-26'), type: 'national', description: 'Declaration of independence.' },
    { name: 'Bengali New Year (Pohela Boishakh)', date: new Date('2026-04-14'), type: 'religious', description: 'First day of the Bengali calendar.' },
    { name: 'May Day', date: new Date('2026-05-01'), type: 'public', description: 'International Workers\' Day.' },
    { name: 'Buddha Purnima', date: new Date('2026-05-19'), type: 'religious', description: 'Birth of Lord Buddha.' },
    { name: 'National Mourning Day', date: new Date('2026-08-15'), type: 'national', description: 'Martyrdom anniversary of Sheikh Mujibur Rahman.' },
    { name: 'Victory Day of Bangladesh', date: new Date('2026-12-16'), type: 'national', description: 'Victory day in the liberation war.' },
    { name: 'Christmas Day', date: new Date('2026-12-25'), type: 'religious', description: 'Celebration of Christmas.' }
  ];

  // ── SEEDING STRATEGY 1: ONLINE MONGODB SEEDING (if available) ────────────────
  let isMongoSeeded = false;
  if (process.env.MONGO_URI) {
    try {
      console.log('Attempting to seed remote/local MongoDB instance...');
      await mongoose.connect(process.env.MONGO_URI);
      
      // Clear existing records
      await Shift.deleteMany({});
      await Department.deleteMany({});
      await Designation.deleteMany({});
      await LeaveType.deleteMany({});
      await Holiday.deleteMany({});

      // Insert fresh data
      const seededShifts = await Shift.insertMany(shifts);
      console.log(`- Seeded ${seededShifts.length} Shift configurations successfully.`);

      const seededDepts = await Department.insertMany(departments);
      console.log(`- Seeded ${seededDepts.length} Department records successfully.`);

      // Link departments to designations
      const devDept = seededDepts.find(d => d.code === 'DEV');
      const mktgDept = seededDepts.find(d => d.code === 'MKTG');

      const linkedDesignations = designations.map(des => {
        if (des.title.includes('Software') || des.title.includes('Developer') || des.title.includes('Tech')) {
          return { ...des, department: devDept._id };
        }
        return { ...des, department: mktgDept._id };
      });

      const seededDesigs = await Designation.insertMany(linkedDesignations);
      console.log(`- Seeded ${seededDesigs.length} Designation profiles successfully.`);

      const seededLeaves = await LeaveType.insertMany(leaveTypes);
      console.log(`- Seeded ${seededLeaves.length} Leave Type rules successfully.`);

      const seededHolidays = await Holiday.insertMany(holidays);
      console.log(`- Seeded ${seededHolidays.length} Bangladesh Calendar Holidays successfully.`);

      isMongoSeeded = true;
      console.log('MongoDB Seeding Complete!');
      await mongoose.disconnect();
    } catch (err) {
      console.warn('MongoDB connection failed. Skipping direct MongoDB seeding. Error:', err.message);
    }
  }

  // ── SEEDING STRATEGY 2: OFFLINE fallback db.json SEEDING ────────────────────
  try {
    console.log('Updating offline fallback database JSON collection (db.json)...');
    
    let dbData = { users: [], leads: [], clients: [], campaigns: [], whatsappmessages: [], clientnotes: [], leadnotes: [] };
    if (fs.existsSync(DB_FILE)) {
      try {
        dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      } catch {
        // use initial empty data structures
      }
    }

    // Helper function to create randomized IDs for in-memory docs
    const makeId = () => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

    // Overwrite HR collections with seeded values
    const seededJsonShifts = shifts.map(s => ({ ...s, _id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    const seededJsonDepts = departments.map(d => ({ ...d, _id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

    const devDeptJson = seededJsonDepts.find(d => d.code === 'DEV');
    const mktgDeptJson = seededJsonDepts.find(d => d.code === 'MKTG');

    const seededJsonDesigs = designations.map(des => ({
      ...des,
      _id: makeId(),
      department: des.title.includes('Software') || des.title.includes('Developer') ? devDeptJson._id : mktgDeptJson._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const seededJsonLeaves = leaveTypes.map(l => ({ ...l, _id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    const seededJsonHolidays = holidays.map(h => ({ ...h, _id: makeId(), date: h.date.toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

    dbData.shifts = seededJsonShifts;
    dbData.departments = seededJsonDepts;
    dbData.designations = seededJsonDesigs;
    dbData.leavetypes = seededJsonLeaves;
    dbData.holidays = seededJsonHolidays;
    dbData.employees = dbData.employees || [];
    dbData.attendances = dbData.attendances || [];
    dbData.leaves = dbData.leaves || [];
    dbData.leavebalances = dbData.leavebalances || [];
    dbData.salarystructures = dbData.salarystructures || [];
    dbData.payrolls = dbData.payrolls || [];
    dbData.appraisals = dbData.appraisals || [];

    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
    console.log('db.json Fallback Collections Seeded Successfully!');
  } catch (err) {
    console.error('Failed to write seed data to offline db.json:', err.message);
  }

  console.log('All HR Database Seeding Tasks Finished Successfully!');
  process.exit(0);
};

seedData();
