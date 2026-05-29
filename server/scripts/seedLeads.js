const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Dummy data arrays
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 'Robert', 'Karen', 'William', 'Linda', 'Richard', 'Susan', 'Thomas', 'Margaret'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
const companies = ['AeroMedia', 'PixelTech', 'Nexus Corp', 'Apex Web Solutions', 'CloudSphere', 'Delta Consulting', 'Vanguard Media', 'Zenix Global', 'Horizon IT', 'Stratford Group'];
const domains = ['com', 'org', 'net', 'io', 'co'];
const phonePrefixes = ['+1', '+44', '+880', '+92'];
const tagsPool = ['urgent', 'high-budget', 'referred', 'new-startup', 'enterprise', 're-engage', 'newsletter-signup'];
const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const sources = ['website', 'whatsapp', 'referral', 'social_media', 'cold_call', 'email', 'other'];
const priorities = ['low', 'medium', 'high'];
const services = ['seo', 'social_media_marketing', 'ppc', 'web_design', 'web_development', 'content_marketing', 'email_marketing', 'branding', 'video_marketing'];

// Helper to get random item
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomSubset = (arr, maxItems = 3) => {
  const count = randomInt(1, maxItems);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate 10 random leads
const generateLeads = (adminId) => {
  const leads = [];
  for (let i = 0; i < 10; i++) {
    const fName = randomItem(firstNames);
    const lName = randomItem(lastNames);
    const name = `${fName} ${lName}`;
    const company = randomItem(companies);
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.${randomItem(domains)}`;
    const phone = `${randomItem(phonePrefixes)}${randomInt(300, 999)}${randomInt(1000000, 9999999)}`;
    const website = `www.${company.toLowerCase().replace(/\s+/g, '')}.com`;
    
    const minBudget = randomItem([500, 1000, 2500, 5000, 10000]);
    const maxBudget = minBudget + randomItem([500, 1000, 2500, 5000]);
    
    leads.push({
      name,
      email,
      phone,
      company,
      website,
      status: randomItem(statuses),
      source: randomItem(sources),
      priority: randomItem(priorities),
      interestedServices: randomSubset(services, 3),
      budget: {
        min: minBudget,
        max: maxBudget,
        currency: randomItem(['USD', 'BDT', 'EUR'])
      },
      notes: `Interested in custom solutions. Budget ranges between ${minBudget} and ${maxBudget}. Contacted via ${randomItem(['email', 'phone'])}.`,
      tags: randomSubset(tagsPool, 2),
      assignedTo: adminId,
      createdBy: adminId,
      convertedToClient: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  return leads;
};

async function run() {
  const adminId = '6a077f67b28c9045e705cf02'; // Default admin id from db.json
  
  // Try connecting to MongoDB first
  let isConnected = false;
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      isConnected = true;
      console.log('Connected to MongoDB database.');
    }
  } catch (err) {
    console.log('MongoDB connection failed. Seeding to offline JSON database...');
  }

  const dummyLeads = generateLeads(adminId);

  if (isConnected) {
    const Lead = require('../models/Lead');
    const inserted = await Lead.insertMany(dummyLeads);
    console.log(`Successfully seeded ${inserted.length} leads to MongoDB.`);
    await mongoose.disconnect();
  } else {
    // Write directly to local db.json
    const fs = require('fs');
    const DB_FILE = path.join(__dirname, '../data/db.json');
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      dummyLeads.forEach(lead => {
        lead._id = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        data.leads.push(lead);
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      console.log(`Successfully seeded ${dummyLeads.length} leads to offline JSON database (db.json).`);
    } else {
      console.error('db.json file not found! Please run the dev server first to initialize it.');
    }
  }
}

run().catch(console.error);
