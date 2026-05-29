import api from './api';

export const hrService = {
  // Employees
  getEmployees: (params) => api.get('/hr/employees', { params }),
  getEmployee: (id) => api.get(`/hr/employees/${id}`),
  createEmployee: (data) => api.post('/hr/employees', data),
  updateEmployee: (id, data) => api.put(`/hr/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/hr/employees/${id}`),

  // Departments, Designations & Shifts (MERN synced)
  getDepartments: () => api.get('/hr/departments'),
  createDepartment: (data) => api.post('/hr/departments', data),
  updateDepartment: (id, data) => api.put(`/hr/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/hr/departments/${id}`),

  getDesignations: () => api.get('/hr/designations'),
  createDesignation: (data) => api.post('/hr/designations', data),
  updateDesignation: (id, data) => api.put(`/hr/designations/${id}`, data),
  deleteDesignation: (id) => api.delete(`/hr/designations/${id}`),

  getShifts: () => api.get('/hr/shifts'),
  createShift: (data) => api.post('/hr/shifts', data),
  updateShift: (id, data) => api.put(`/hr/shifts/${id}`, data),
  deleteShift: (id) => api.delete(`/hr/shifts/${id}`),

  // Attendance
  checkIn: (location) => api.post('/hr/attendance/check-in', { location }),
  checkOut: (location) => api.post('/hr/attendance/check-out', { location }),
  getAttendanceHistory: (params) => api.get('/hr/attendance', { params }),

  // Leaves
  applyLeave: (data) => api.post('/hr/leaves/apply', data),
  approveLeave: (id) => api.put(`/hr/leaves/${id}/approve`),
  rejectLeave: (id, reason) => api.put(`/hr/leaves/${id}/reject`, { rejectionReason: reason }),
  getLeaves: (params) => api.get('/hr/leaves', { params }),
  getLeaveBalances: (employeeId, params) => api.get(`/hr/leaves/balance/${employeeId || ''}`, { params }),
  getLeaveTypes: () => api.get('/hr/leave-types'),

  // Payroll
  generatePayroll: (data) => api.post('/hr/payroll/generate', data),
  processPayroll: (id, data) => api.put(`/hr/payroll/${id}/process`, data),
  getPayrollRecords: (params) => api.get('/hr/payroll', { params }),
  getPayslipDownloadUrl: (id) => `${import.meta.env.VITE_API_URL}/hr/payroll/${id}/payslip`,

  // Appraisals
  getAppraisals: (params) => api.get('/hr/appraisals', { params }),
  createAppraisal: (data) => api.post('/hr/appraisals', data),
  submitAppraisal: (id) => api.put(`/hr/appraisals/${id}/submit`),
  reviewAppraisal: (id, data) => api.put(`/hr/appraisals/${id}/review`, data),

  // Dashboard Stats
  getDashboardStats: () => api.get('/hr/dashboard'),
};
