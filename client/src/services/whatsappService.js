import api from './api';

export const whatsappService = {
  getInbox: () => api.get('/whatsapp/inbox').then((r) => r.data),
  getConversation: (phone, params) =>
    api.get(`/whatsapp/conversation/${phone}`, { params }).then((r) => r.data),
  sendMessage: (data) => api.post('/whatsapp/send', data).then((r) => r.data),
  sendTemplate: (data) => api.post('/whatsapp/send-template', data).then((r) => r.data),
};
