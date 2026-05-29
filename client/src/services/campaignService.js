import api from './api';

export const campaignService = {
  getAll:  (params) => api.get('/campaigns', { params }).then((r) => r.data),
  getOne:  (id) => api.get(`/campaigns/${id}`).then((r) => r.data),
  create:  (data) => api.post('/campaigns', data).then((r) => r.data),
  update:  (id, data) => api.put(`/campaigns/${id}`, data).then((r) => r.data),
  remove:  (id) => api.delete(`/campaigns/${id}`).then((r) => r.data),
};
