import api from './api';

const projectService = {
  // ═══════════════════════════════════════════════════════════
  // DASHBOARD & LESSONS (Cross-Project)
  // ═══════════════════════════════════════════════════════════
  getPortfolioDashboard: async () => {
    const res = await api.get('/pm/dashboard');
    return res.data;
  },
  searchLessons: async (params) => {
    const res = await api.get('/pm/lessons', { params });
    return res.data;
  },
  getLessonCategories: async () => {
    const res = await api.get('/pm/lessons/categories');
    return res.data;
  },
  getResourceAvailability: async (params) => {
    const res = await api.get('/pm/resources/availability', { params });
    return res.data;
  },

  // ═══════════════════════════════════════════════════════════
  // MASTER PROJECT CRUD
  // ═══════════════════════════════════════════════════════════
  getProjects: async (params) => {
    const res = await api.get('/pm/projects', { params });
    return res.data;
  },
  getProject: async (id) => {
    const res = await api.get(`/pm/projects/${id}`);
    return res.data;
  },
  createProject: async (data) => {
    const res = await api.post('/pm/projects', data);
    return res.data;
  },
  updateProject: async (id, data) => {
    const res = await api.put(`/pm/projects/${id}`, data);
    return res.data;
  },
  deleteProject: async (id) => {
    const res = await api.delete(`/pm/projects/${id}`);
    return res.data;
  },
  movePhase: async (id, phase) => {
    const res = await api.post(`/pm/projects/${id}/move-phase`, { targetPhase: phase });
    return res.data;
  },
  getProjectDashboard: async (id) => {
    const res = await api.get(`/pm/projects/${id}/dashboard`);
    return res.data;
  },
  cloneProject: async (id, cloneOptions) => {
    const res = await api.post(`/pm/projects/${id}/clone`, cloneOptions);
    return res.data;
  },

  // ═══════════════════════════════════════════════════════════
  // CHARTER (Initiation)
  // ═══════════════════════════════════════════════════════════
  getCharter: async (id) => {
    const res = await api.get(`/pm/projects/${id}/charter`);
    return res.data;
  },
  updateCharter: async (id, data) => {
    const res = await api.put(`/pm/projects/${id}/charter`, data);
    return res.data;
  },
  submitCharterForApproval: async (id) => {
    const res = await api.post(`/pm/projects/${id}/charter/submit-for-approval`);
    return res.data;
  },
  approveCharter: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/charter/approve`, data);
    return res.data;
  },
  downloadCharterPDF: (id) => {
    window.open(`${api.defaults.baseURL}/pm/projects/${id}/charter/pdf`, '_blank');
  },

  // ═══════════════════════════════════════════════════════════
  // SCHEDULE & TASKS
  // ═══════════════════════════════════════════════════════════
  getSchedule: async (id) => {
    const res = await api.get(`/pm/projects/${id}/schedule`);
    return res.data;
  },
  lockBaseline: async (id) => {
    const res = await api.post(`/pm/projects/${id}/schedule/baseline`);
    return res.data;
  },
  getCriticalPath: async (id) => {
    const res = await api.get(`/pm/projects/${id}/critical-path`);
    return res.data;
  },
  getGanttData: async (id) => {
    const res = await api.get(`/pm/projects/${id}/gantt-data`);
    return res.data;
  },
  getTasks: async (id, params) => {
    const res = await api.get(`/pm/projects/${id}/tasks`, { params });
    return res.data;
  },
  createTask: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/tasks`, data);
    return res.data;
  },
  updateTask: async (taskId, data) => {
    const res = await api.put(`/pm/tasks/${taskId}`, data);
    return res.data;
  },
  deleteTask: async (taskId) => {
    const res = await api.delete(`/pm/tasks/${taskId}`);
    return res.data;
  },

  // ═══════════════════════════════════════════════════════════
  // BUDGET & EXPENSES
  // ═══════════════════════════════════════════════════════════
  getBudget: async (id) => {
    const res = await api.get(`/pm/projects/${id}/budget`);
    return res.data;
  },
  updateBudget: async (id, data) => {
    const res = await api.put(`/pm/projects/${id}/budget`, data);
    return res.data;
  },
  getEVM: async (id) => {
    const res = await api.get(`/pm/projects/${id}/budget/evm`);
    return res.data;
  },
  getExpenses: async (id, params) => {
    const res = await api.get(`/pm/projects/${id}/expenses`, { params });
    return res.data;
  },
  createExpense: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/expenses`, data);
    return res.data;
  },

  // ═══════════════════════════════════════════════════════════
  // RESOURCES & RACI
  // ═══════════════════════════════════════════════════════════
  getResources: async (id) => {
    const res = await api.get(`/pm/projects/${id}/resources`);
    return res.data;
  },
  addResource: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/resources`, data);
    return res.data;
  },
  updateResource: async (resId, data) => {
    const res = await api.put(`/pm/resources/${resId}`, data);
    return res.data;
  },
  getRACI: async (id) => {
    const res = await api.get(`/pm/projects/${id}/raci`);
    return res.data;
  },
  updateRACI: async (id, data) => {
    const res = await api.put(`/pm/projects/${id}/raci`, data);
    return res.data;
  },

  // ═══════════════════════════════════════════════════════════
  // RAIDD LOG
  // ═══════════════════════════════════════════════════════════
  getRAIDD: async (id, params) => {
    const res = await api.get(`/pm/projects/${id}/raidd`, { params });
    return res.data;
  },
  addRAIDD: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/raidd`, data);
    return res.data;
  },
  updateRAIDD: async (entryId, data) => {
    const res = await api.put(`/pm/raidd/${entryId}`, data);
    return res.data;
  },
  deleteRAIDD: async (entryId) => {
    const res = await api.delete(`/pm/raidd/${entryId}`);
    return res.data;
  },

  // ═══════════════════════════════════════════════════════════
  // STATUS REPORTS
  // ═══════════════════════════════════════════════════════════
  getStatusReports: async (id) => {
    const res = await api.get(`/pm/projects/${id}/status-reports`);
    return res.data;
  },
  createStatusReport: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/status-reports`, data);
    return res.data;
  },
  downloadStatusReportPDF: (reportId) => {
    window.open(`${api.defaults.baseURL}/pm/status-reports/${reportId}/pdf`, '_blank');
  },

  // ═══════════════════════════════════════════════════════════
  // MILESTONES
  // ═══════════════════════════════════════════════════════════
  getMilestones: async (id) => {
    const res = await api.get(`/pm/projects/${id}/milestones`);
    return res.data;
  },
  createMilestone: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/milestones`, data);
    return res.data;
  },
  achieveMilestone: async (milestoneId) => {
    const res = await api.post(`/pm/milestones/${milestoneId}/achieve`);
    return res.data;
  },

  // ═══════════════════════════════════════════════════════════
  // CLOSURE
  // ═══════════════════════════════════════════════════════════
  getClosure: async (id) => {
    const res = await api.get(`/pm/projects/${id}/closure`);
    return res.data;
  },
  initiateClosure: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/closure/initiate`, data);
    return res.data;
  },
  signOffClosure: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/closure/sign-off`, data);
    return res.data;
  },
  captureLessonsLearned: async (id, data) => {
    const res = await api.post(`/pm/projects/${id}/closure/lessons-learned`, data);
    return res.data;
  },
  finalizeClosure: async (id) => {
    const res = await api.post(`/pm/projects/${id}/closure/finalize`);
    return res.data;
  },
  downloadClosureReportPDF: (id) => {
    window.open(`${api.defaults.baseURL}/pm/projects/${id}/closure/final-report-pdf`, '_blank');
  },
};

export default projectService;
