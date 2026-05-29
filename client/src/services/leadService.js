import api from './api';

export const leadService = {
  getAll:    (params) => api.get('/leads', { params }).then((r) => r.data),
  getOne:    (id) => api.get(`/leads/${id}`).then((r) => r.data),
  create:    (data) => api.post('/leads', data).then((r) => r.data),
  update:    (id, data) => api.put(`/leads/${id}`, data).then((r) => r.data),
  remove:    (id) => api.delete(`/leads/${id}`).then((r) => r.data),
  convert:   (id, data) => api.post(`/leads/${id}/convert`, data).then((r) => r.data),
  getStats:  () => api.get('/leads/stats').then((r) => r.data),
  getNotes:  (id) => api.get(`/leads/${id}/notes`).then((r) => r.data),
  addNote:   (id, data) => api.post(`/leads/${id}/notes`, data).then((r) => r.data),
};
