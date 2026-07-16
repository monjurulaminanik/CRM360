import api from './api';

export const metaService = {
  getStatus: () => api.get('/meta/status').then((r) => r.data),
  getMessengerInbox: () => api.get('/meta/messenger/inbox').then((r) => r.data),
  getMessengerConversation: (psid) =>
    api.get(`/meta/messenger/conversation/${psid}`).then((r) => r.data),
  syncLeads: (formId) =>
    api.get('/meta/sync-leads', { params: formId ? { form_id: formId } : {} }).then((r) => r.data),
};
