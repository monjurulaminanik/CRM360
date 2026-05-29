import api from './api';

export const getJobs = async (params) => {
  const response = await api.get('/recruitment/jobs', { params });
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/recruitment/jobs', jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/recruitment/jobs/${id}`);
  return response.data;
};

export const getCandidates = async (params) => {
  const response = await api.get('/recruitment/candidates', { params });
  return response.data;
};

export const addCandidate = async (candidateData) => {
  const response = await api.post('/recruitment/candidates', candidateData);
  return response.data;
};

export const updateCandidateStatus = async (id, status) => {
  const response = await api.put(`/recruitment/candidates/${id}/status`, { status });
  return response.data;
};

export const deleteCandidate = async (id) => {
  const response = await api.delete(`/recruitment/candidates/${id}`);
  return response.data;
};
