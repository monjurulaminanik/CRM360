const Project = require('../models/Project');

const TEMPLATES = [
  {
    name: 'Standard Website Development',
    projectType: 'web-design',
    templateCategory: 'Software Development',
    currentPhase: 'initiation',
    tags: ['Web Design', 'Development', 'CMS'],
    phases: ['initiation', 'planning', 'execution', 'monitoring', 'closure'],
  },
  {
    name: 'Monthly SEO Campaign',
    projectType: 'seo',
    templateCategory: 'Digital Marketing',
    currentPhase: 'initiation',
    tags: ['SEO', 'Monthly Retainer', 'Marketing'],
    billingType: 'retainer',
  },
  {
    name: 'Social Media Marketing',
    projectType: 'marketing',
    templateCategory: 'Digital Marketing',
    currentPhase: 'initiation',
    tags: ['SMM', 'Facebook Ads', 'Content creation'],
  },
  {
    name: 'Custom Mobile App (iOS + Android)',
    projectType: 'mobile-app',
    templateCategory: 'Software Development',
    currentPhase: 'initiation',
    tags: ['Mobile App', 'React Native', 'Flutter'],
    billingType: 'milestone-based',
  },
  {
    name: 'Brand Identity & Strategy',
    projectType: 'branding',
    templateCategory: 'Branding',
    currentPhase: 'initiation',
    tags: ['Branding', 'Logo', 'Strategy'],
  },
  {
    name: 'WhatsApp Automation Setup',
    projectType: 'whatsapp-automation',
    templateCategory: 'Automation',
    currentPhase: 'initiation',
    tags: ['WhatsApp', 'Chatbot', 'Automation'],
  },
  {
    name: 'Hybrid Marketing & Tech Combo',
    projectType: 'hybrid',
    templateCategory: 'Hybrid Solutions',
    currentPhase: 'initiation',
    tags: ['Full Service', 'Tech', 'Marketing'],
  }
];

const seedProjectTemplates = async (tenantId, adminUserId) => {
  try {
    for (const tpl of TEMPLATES) {
      const exists = await Project.findOne({ tenantId, isTemplate: true, name: tpl.name });
      if (!exists) {
        await Project.create({
          ...tpl,
          tenantId,
          isTemplate: true,
          templateName: tpl.name,
          createdBy: adminUserId,
          projectManager: adminUserId,
        });
      }
    }
    console.log('Project templates seeded successfully');
  } catch (error) {
    console.error('Error seeding project templates:', error);
  }
};

module.exports = { seedProjectTemplates };
