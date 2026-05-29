import api from './api';

export const getInvoices = async (params) => {
  const response = await api.get('/invoices', { params });
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (invoiceData) => {
  const response = await api.post('/invoices', invoiceData);
  return response.data;
};

export const updateInvoice = async (id, invoiceData) => {
  const response = await api.put(`/invoices/${id}`, invoiceData);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await api.delete(`/invoices/${id}`);
  return response.data;
};

export const addPayment = async (id, paymentData) => {
  const response = await api.post(`/invoices/${id}/payments`, paymentData);
  return response.data;
};
