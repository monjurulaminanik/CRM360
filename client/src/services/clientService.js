import api from './api';

export const clientService = {
  getAll:          (params) => api.get('/clients', { params }).then((r) => r.data),
  getOne:          (id) => api.get(`/clients/${id}`).then((r) => r.data),
  create:          (data) => api.post('/clients', data).then((r) => r.data),
  update:          (id, data) => api.put(`/clients/${id}`, data).then((r) => r.data),
  remove:          (id) => api.delete(`/clients/${id}`).then((r) => r.data),
  getStats:        () => api.get('/clients/stats').then((r) => r.data),
  getNotes:        (id) => api.get(`/clients/${id}/notes`).then((r) => r.data),
  addNote:         (id, data) => api.post(`/clients/${id}/notes`, data).then((r) => r.data),
  generateMagicLink: (id) => api.post(`/clients/${id}/magic-link`).then((r) => r.data),
};
