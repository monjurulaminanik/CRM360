/**
 * Seed rich Bangladeshi dummy data for D360 CRM (Atlas / production).
 * Usage: cd server && node scripts/seedBD.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Task = require('../models/Task');
const WhatsAppMessage = require('../models/WhatsAppMessage');

const BD_FIRST = [
  'Rahim', 'Karim', 'Fahim', 'Sakib', 'Tanvir', 'Rafi', 'Imran', 'Nayeem', 'Shakil', 'Hasan',
  'Fatima', 'Ayesha', 'Nusrat', 'Sadia', 'Mim', 'Ruma', 'Sumaiya', 'Jannat', 'Nila', 'Priya',
  'Abdullah', 'Mahmud', 'Jahid', 'Rakib', 'Sajid', 'Mehedi', 'Arif', 'Shuvo', 'Bappy', 'Liton',
];
const BD_LAST = [
  'Ahmed', 'Hossain', 'Islam', 'Rahman', 'Khan', 'Chowdhury', 'Hasan', 'Uddin', 'Akter', 'Begum',
  'Siddique', 'Mahmud', 'Alam', 'Kabir', 'Mia', 'Sarkar', 'Biswas', 'Das', 'Roy', 'Talukder',
];
const BD_COMPANIES = [
  'Green Valley Agro', 'Dhaka Fashion Hub', 'Chittagong Soft Tech', 'Sylhet Tea Traders',
  'Banani Real Homes', 'Uttara EduCare', 'Motijheel Finance Plus', 'Gulshan MediCare',
  'Mirpur Digital Mart', 'Rajshahi Silk House', 'Khulna Logistics BD', 'Barisal Fresh Foods',
  'Comilla Electronics', 'Gazipur Knitwear Ltd', 'Narayanganj Yarn Co', 'Bogura Dairy Farm',
  'Rangpur Agro Seed', 'Jessore Jute Mills', 'Cox Bazar Tourism BD', 'Savar Furniture World',
];
const BD_AREAS = [
  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohakhali', 'Motijheel', 'Farmgate',
  'Bashundhara', 'Wari', 'Old Dhaka', 'Agrabad', 'GEC Circle', 'Zindabazar', 'Khulshi',
];
const BD_CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Mymensingh'];
const SOURCES = ['whatsapp', 'facebook', 'facebook_ads', 'messenger', 'website', 'referral', 'cold_call'];
const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const PRIORITIES = ['low', 'medium', 'high'];
const SERVICES = ['seo', 'social_media_marketing', 'ppc', 'web_design', 'web_development', 'branding'];
const TASK_TITLES = [
  'Facebook Ads ক্যাম্পেইন সেটআপ',
  'ক্লায়েন্টকে WhatsApp ফলো-আপ',
  'ওয়েবসাইট হোমপেজ ডিজাইন রিভিউ',
  'SEO কীওয়ার্ড রিসার্চ (বাংলা)',
  'ইনভয়েস পাঠানো — মাসিক রিটেইনার',
  'ল্যান্ডিং পেজ কপি আপডেট',
  'Google Ads কনভার্সন ট্র্যাকিং',
  'ব্র্যান্ড লোগো ফাইনাল ডেলিভারি',
  'ক্লায়েন্ট মিটিং — Zoom',
  'কনটেন্ট ক্যালেন্ডার তৈরি',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function phone() {
  const prefixes = ['013', '014', '015', '016', '017', '018', '019'];
  return `${pick(prefixes)}${String(Math.floor(10000000 + Math.random() * 89999999))}`;
}
function email(name, company) {
  const slug = name.toLowerCase().replace(/\s+/g, '.');
  const domain = company.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) + '.com.bd';
  return `${slug}@${domain}`;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function run() {
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
  }

  let admin = await User.findOne({ email: 'anik@dawatit.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Monjurul Amin Anik',
      email: 'anik@dawatit.com',
      password: 'Admin@D360',
      role: 'admin',
      isActive: true,
      tenantId: tenant._id,
    });
  } else if (!admin.tenantId) {
    admin.tenantId = tenant._id;
    await admin.save();
  }

  console.log('Clearing previous demo leads/clients/tasks/whatsapp for tenant...');
  await Lead.deleteMany({ tenantId: tenant._id });
  await Client.deleteMany({ tenantId: tenant._id });
  await Task.deleteMany({ tenantId: tenant._id });
  await WhatsAppMessage.deleteMany({});

  // Agents
  const agents = [];
  const agentDefs = [
    { name: 'Sadia Rahman', email: 'sadia@dawatit.com' },
    { name: 'Rafiul Islam', email: 'rafi@dawatit.com' },
    { name: 'Nusrat Jahan', email: 'nusrat@dawatit.com' },
  ];
  for (const a of agentDefs) {
    let u = await User.findOne({ email: a.email });
    if (!u) {
      u = await User.create({
        ...a,
        password: 'Agent@D360',
        role: 'agent',
        isActive: true,
        tenantId: tenant._id,
      });
    } else {
      u.tenantId = tenant._id;
      await u.save();
    }
    agents.push(u);
  }

  // Clients (18)
  console.log('Seeding BD clients...');
  const clients = [];
  for (let i = 0; i < 18; i++) {
    const name = `${pick(BD_FIRST)} ${pick(BD_LAST)}`;
    const company = BD_COMPANIES[i % BD_COMPANIES.length];
    const city = pick(BD_CITIES);
    const c = await Client.create({
      name,
      company,
      email: email(name, company),
      phone: phone(),
      whatsappNumber: phone(),
      website: `https://www.${company.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com.bd`,
      tenantId: tenant._id,
      address: {
        street: `${Math.floor(Math.random() * 200) + 1}, ${pick(BD_AREAS)} Road`,
        city,
        state: city,
        country: 'Bangladesh',
        postalCode: String(1000 + Math.floor(Math.random() * 8000)),
      },
      industry: pick(['E-commerce', 'Education', 'Healthcare', 'Real Estate', 'FMCG', 'IT', 'Tourism']),
      businessType: pick(['startup', 'sme', 'enterprise']),
      status: pick(['active', 'active', 'active', 'on_hold', 'inactive']),
      tier: pick(['basic', 'standard', 'premium']),
      activeServices: [{
        service: pick(SERVICES),
        startDate: daysFromNow(-60),
        monthlyRetainer: pick([15000, 25000, 40000, 75000, 120000]),
        currency: 'BDT',
      }],
      preferredContact: 'whatsapp',
      notes: `${company} — ${city} ভিত্তিক ক্লায়েন্ট। মাসিক রিটেইনার চলমান।`,
      tags: ['bd', 'retainer', pick(['seo', 'ads', 'web'])],
      accountManager: pick(agents)._id,
      createdBy: admin._id,
    });
    clients.push(c);
  }

  // Leads (40)
  console.log('Seeding BD leads...');
  const leads = [];
  for (let i = 0; i < 40; i++) {
    const name = `${pick(BD_FIRST)} ${pick(BD_LAST)}`;
    const company = pick(BD_COMPANIES);
    const status = pick(STATUSES);
    const source = pick(SOURCES);
    const l = await Lead.create({
      name,
      company,
      email: email(name, company),
      phone: phone(),
      website: `https://${company.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 10)}.bd`,
      tenantId: tenant._id,
      status,
      source,
      priority: pick(PRIORITIES),
      interestedServices: [pick(SERVICES), pick(SERVICES)],
      budget: {
        min: pick([10000, 20000, 30000]),
        max: pick([50000, 80000, 150000, 250000]),
        currency: 'BDT',
      },
      notes: `${pick(BD_AREAS)}, ${pick(BD_CITIES)} থেকে ইন্টারেস্ট। ${source} সোর্স।`,
      tags: ['bangladesh', source],
      assignedTo: pick([null, ...agents.map((a) => a._id)]),
      createdBy: admin._id,
      nextFollowUp: daysFromNow(pick([1, 2, 3, 5, 7])),
      lastContactedAt: daysFromNow(pick([-1, -3, -7, -14])),
    });
    leads.push(l);
  }

  // Tasks (24)
  console.log('Seeding BD tasks...');
  for (let i = 0; i < 24; i++) {
    await Task.create({
      tenantId: tenant._id,
      title: pick(TASK_TITLES),
      description: `ক্লায়েন্ট ডেলিভারেবল — ${pick(BD_COMPANIES)}`,
      priority: pick(PRIORITIES),
      status: pick(['todo', 'in-progress', 'review', 'completed']),
      dueDate: daysFromNow(pick([-2, 0, 1, 3, 7, 14])),
      assignee: pick(agents)._id,
      createdBy: admin._id,
      clientId: pick(clients)._id,
    });
  }

  // WhatsApp sample chats (8 conversations)
  console.log('Seeding WhatsApp messages...');
  for (let i = 0; i < 8; i++) {
    const lead = leads[i];
    const p = lead.phone.replace(/\D/g, '');
    await WhatsAppMessage.create({
      waMessageId: `bd_seed_in_${i}_1`,
      conversationId: p,
      from: p,
      to: '8801700000000',
      direction: 'inbound',
      type: 'text',
      content: { text: `আসসালামু আলাইকুম, ${lead.company} এর জন্য প্রাইস জানতে চাই।` },
      status: 'delivered',
      sentAt: daysFromNow(-1),
      leadId: lead._id,
    });
    await WhatsAppMessage.create({
      waMessageId: `bd_seed_out_${i}_1`,
      conversationId: p,
      from: '8801700000000',
      to: p,
      direction: 'outbound',
      type: 'text',
      content: { text: `ওয়ালাইকুম আসসালাম ${lead.name} ভাই/আপা, প্যাকেজ ডিটেইলস পাঠাচ্ছি।` },
      status: 'read',
      sentAt: daysFromNow(-1),
      leadId: lead._id,
      sentBy: admin._id,
    });
  }

  console.log('——— BD seed complete ———');
  console.log(`Clients: ${clients.length}, Leads: ${leads.length}, Tasks: 24, WA convos: 8`);
  console.log('Login: anik@dawatit.com / Admin@D360');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
