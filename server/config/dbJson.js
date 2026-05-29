const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DB_FILE = path.join(__dirname, '../data/db.json');

const ensureDirectoryExists = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

let isSeeded = false;

const loadData = () => {
  ensureDirectoryExists();
  let data = {
    users: [],
    leads: [],
    clients: [],
    campaigns: [],
    whatsappmessages: [],
    clientnotes: [],
    leadnotes: [],
    employees: [],
    departments: [],
    designations: [],
    attendances: [],
    leavetypes: [],
    leaves: [],
    leavebalances: [],
    holidays: [],
    shifts: [],
    salarystructures: [],
    payrolls: [],
    appraisals: [],
    tenants: [],
    tasks: [],
    expenses: [],
    expensecategories: [],
    invoices: [],
    payments: [],
    projects: [],
    timelogs: []
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      data = { ...data, ...parsed };
    } catch (e) {
      console.error('Failed to parse database file, resetting to template:', e.message);
    }
  }

  if (isSeeded) {
    return data;
  }

  let modified = false;

  // 1. Dynamic Tenant Migration & Seeding
  if (!data.tenants || data.tenants.length === 0) {
    data.tenants = [
      {
        _id: '6a077f67b28c9045e705cf00',
        name: 'Dawat IT',
        slug: 'dawatit',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
        expiresAt: '2030-12-31T23:59:59.000Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    modified = true;
  }
  const defaultTenantId = data.tenants[0]._id;

  // 2. Dynamic Seed Users Seeding
  const getSeedUsers = () => [
    {
      _id: '6a077f67b28c9045e705cf02',
      name: 'Monjurul Amin Anik',
      email: 'anik@dawatit.com',
      password: bcrypt.hashSync('Admin@D360', 12),
      role: 'admin',
      tenantId: defaultTenantId,
      isActive: true,
    },
    {
      _id: '6a077f67b28c9045e705cf0a',
      name: 'Global Superadmin',
      email: 'superadmin@d360.com',
      password: bcrypt.hashSync('Super@D360', 12),
      role: 'superadmin',
      isActive: true,
    },
    {
      _id: '6a077f67b28c9045e705cf0b',
      name: 'John Hernandez',
      email: 'client@d360.com',
      password: bcrypt.hashSync('Client@D360', 12),
      role: 'client',
      tenantId: defaultTenantId,
      isActive: true,
    },
    {
      _id: '6a077f67b28c9045e705cf0c',
      name: 'Monjurul Amin',
      email: 'employee@d360.com',
      password: bcrypt.hashSync('Employee@D360', 12),
      role: 'employee',
      tenantId: defaultTenantId,
      isActive: true,
    }
  ];

  if (!data.users) {
    data.users = [];
    modified = true;
  }

  const seedUsers = getSeedUsers();
  seedUsers.forEach(seedUser => {
    const existingIdx = data.users.findIndex(u => u.email === seedUser.email);
    if (existingIdx !== -1) {
      const existing = data.users[existingIdx];
      // Force seed password hashes and user attributes at start
      data.users[existingIdx] = {
        ...existing,
        ...seedUser,
        password: seedUser.password, // force seed password hash
        createdAt: existing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      modified = true;
    } else {
      data.users.push({
        ...seedUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      modified = true;
    }
  });

  // Ensure default client exists in database matching user client@d360.com
  if (data.clients && data.clients.length > 0) {
    const Hernandez = data.clients.find(c => c.email === 'john.hernandez@pixeltech.com');
    if (Hernandez) {
      Hernandez.email = 'client@d360.com'; // match our seed email
      modified = true;
    }
  }

  // 3. Populate tenantId across all records that do not have one
  const collections = [
    'users', 'leads', 'clients', 'campaigns', 'whatsappmessages',
    'clientnotes', 'leadnotes', 'employees', 'departments',
    'designations', 'attendances', 'leavetypes', 'leaves',
    'leavebalances', 'holidays', 'shifts', 'salarystructures',
    'payrolls', 'appraisals', 'tasks',
    'expenses', 'expensecategories', 'invoices', 'payments', 'projects', 'timelogs'
  ];

  collections.forEach(colName => {
    if (data[colName]) {
      data[colName] = data[colName].map(item => {
        if (colName === 'users' && item.role === 'superadmin') {
          return item;
        }
        if (!item.tenantId) {
          item.tenantId = defaultTenantId;
          modified = true;
        }
        return item;
      });
    }
  });

  isSeeded = true;
  if (modified) {
    saveData(data);
  }
  return data;
};

const saveData = (data) => {
  ensureDirectoryExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

class MockDoc {
  constructor(collectionName, data) {
    this._collectionName = collectionName;
    Object.assign(this, data);
  }

  async save() {
    const data = loadData();
    const items = data[this._collectionName] || [];
    const idx = items.findIndex(item => item._id === this._id);
    
    const cleanProps = { ...this };
    delete cleanProps._collectionName;

    if (idx !== -1) {
      items[idx] = cleanProps;
    } else {
      items.push(cleanProps);
    }
    data[this._collectionName] = items;
    saveData(data);
    return this;
  }

  async populate(path, select) {
    const data = loadData();
    const cleanPath = typeof path === 'object' ? path.path : path;
    const targetId = this[cleanPath];

    if (targetId && typeof targetId !== 'object') {
      let targetCollection = cleanPath.toLowerCase();
      const mappings = {
        createdby: 'users',
        assignedto: 'users',
        accountmanager: 'users',
        clientid: 'clients',
        leadid: 'leads',
        invoiceid: 'invoices',
        projectid: 'projects',
        department: 'departments',
        shift: 'shifts',
        leavetype: 'leavetypes'
      };
      if (mappings[targetCollection]) {
        targetCollection = mappings[targetCollection];
      } else if (targetCollection.endsWith('id')) {
        targetCollection = targetCollection.slice(0, -2) + 's';
      } else if (!targetCollection.endsWith('s')) {
        targetCollection = targetCollection + 's';
      }
      
      const targetItems = data[targetCollection] || [];
      const match = targetItems.find(item => item._id === targetId.toString());
      if (match) {
        this[cleanPath] = match;
      }
    }
    return this;
  }
}

class MockUserDoc extends MockDoc {
  constructor(data) {
    super('users', data);
  }
  async matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  }
  getSignedJwtToken() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production', {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });
  }
}

class QueryChain {
  constructor(data) {
    this.data = data;
  }
  populate(path, select) {
    if (Array.isArray(this.data)) {
      this.data.forEach(doc => {
        if (doc && typeof doc.populate === 'function') {
          doc.populate(path, select);
        }
      });
    } else if (this.data && typeof this.data.populate === 'function') {
      this.data.populate(path, select);
    }
    return this;
  }
  sort() { return this; }
  skip() { return this; }
  limit() { return this; }
  select() { return this; }
  async then(onresolve) {
    if (onresolve) return onresolve(this.data);
    return this.data;
  }
}

class JsonCollection {
  constructor(name, DocClass = null) {
    this.name = name;
    this.DocClass = DocClass;
  }

  wrap(doc) {
    if (!doc) return null;
    return this.DocClass ? new this.DocClass(doc) : new MockDoc(this.name, doc);
  }

  wrapArray(docs) {
    return docs.map(doc => this.wrap(doc));
  }

  find(query = {}) {
    const data = loadData();
    const items = data[this.name] || [];
    const filtered = items.filter(item => {
      for (const key in query) {
        if (key === '$or') {
          return query.$or.some(subQuery => {
            for (const subKey in subQuery) {
              const val = subQuery[subKey];
              if (val && typeof val === 'object' && val.$regex) {
                const regex = new RegExp(val.$regex, val.$options || 'i');
                if (regex.test(item[subKey] || '')) return true;
              } else {
                if (item[subKey]?.toString() === val?.toString()) return true;
              }
            }
            return false;
          });
        }
        const val = query[key];
        if (val && typeof val === 'object' && val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || 'i');
          if (!regex.test(item[key] || '')) return false;
        } else {
          if (item[key]?.toString() !== val?.toString()) return false;
        }
      }
      return true;
    });
    return new QueryChain(this.wrapArray(filtered));
  }

  findOne(query = {}) {
    const res = this.find(query);
    return new QueryChain(res.data[0] || null);
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  countDocuments(query = {}) {
    const res = this.find(query);
    return new QueryChain(res.data.length);
  }

  async create(doc) {
    const data = loadData();
    if (!data[this.name]) data[this.name] = [];
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    if (this.name === 'users' && newDoc.password) {
      newDoc.password = bcrypt.hashSync(newDoc.password, 12);
    }
    data[this.name].push(newDoc);
    saveData(data);
    return this.wrap(newDoc);
  }

  findByIdAndUpdate(id, update, options = {}) {
    const data = loadData();
    const items = data[this.name] || [];
    const idx = items.findIndex(item => item._id === id);
    if (idx === -1) return new QueryChain(null);
    items[idx] = {
      ...items[idx],
      ...update,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return new QueryChain(this.wrap(items[idx]));
  }

  findByIdAndDelete(id) {
    const data = loadData();
    const items = data[this.name] || [];
    const idx = items.findIndex(item => item._id === id);
    if (idx === -1) return new QueryChain(null);
    const deleted = items.splice(idx, 1)[0];
    saveData(data);
    return new QueryChain(this.wrap(deleted));
  }

  async aggregate(pipeline = []) {
    const data = loadData();
    const items = data[this.name] || [];

    if (this.name === 'whatsappmessages') {
      const convoMap = {};
      
      // Sort items by createdAt descending to ensure we catch the newest first
      const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      sortedItems.forEach(item => {
        const cid = item.conversationId;
        if (!convoMap[cid]) {
          convoMap[cid] = {
            _id: cid,
            lastMessage: item,
            unreadCount: 0,
            totalMessages: 0
          };
        }
        convoMap[cid].totalMessages += 1;
        if (item.direction === 'inbound' && item.status !== 'read') {
          convoMap[cid].unreadCount += 1;
        }
      });
      
      const result = Object.values(convoMap);
      // Sort conversations by lastMessage.createdAt descending
      result.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
      return result.slice(0, 50);
    }

    const groupStage = pipeline.find(stage => stage.$group);
    if (groupStage) {
      const groupField = typeof groupStage.$group._id === 'string' && groupStage.$group._id.startsWith('$')
        ? groupStage.$group._id.substring(1)
        : '_id';
      const groups = {};
      items.forEach(item => {
        const val = item[groupField] || 'unknown';
        groups[val] = (groups[val] || 0) + 1;
      });
      return Object.keys(groups).map(key => ({
        _id: key,
        count: groups[key]
      }));
    }
    return items;
  }
}

const dbJson = {
  users: new JsonCollection('users', MockUserDoc),
  leads: new JsonCollection('leads'),
  clients: new JsonCollection('clients'),
  campaigns: new JsonCollection('campaigns'),
  whatsappmessages: new JsonCollection('whatsappmessages'),
  clientnotes: new JsonCollection('clientnotes'),
  leadnotes: new JsonCollection('leadnotes'),
  employees: new JsonCollection('employees'),
  departments: new JsonCollection('departments'),
  designations: new JsonCollection('designations'),
  attendances: new JsonCollection('attendances'),
  leavetypes: new JsonCollection('leavetypes'),
  leaves: new JsonCollection('leaves'),
  leavebalances: new JsonCollection('leavebalances'),
  holidays: new JsonCollection('holidays'),
  shifts: new JsonCollection('shifts'),
  salarystructures: new JsonCollection('salarystructures'),
  payrolls: new JsonCollection('payrolls'),
  appraisals: new JsonCollection('appraisals'),
  tenants: new JsonCollection('tenants'),
  tasks: new JsonCollection('tasks'),
  expenses: new JsonCollection('expenses'),
  expensecategories: new JsonCollection('expensecategories'),
  invoices: new JsonCollection('invoices'),
  payments: new JsonCollection('payments'),
  projects: new JsonCollection('projects'),
  timelogs: new JsonCollection('timelogs'),
  isOffline: true
};

module.exports = dbJson;
