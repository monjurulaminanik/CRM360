import api from './api';

export const getProjects = async (params) => {
  const response = await api.get('/projects', { params });
  return response.data;
};

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

export const logTime = async (id, timeData) => {
  const response = await api.post(`/projects/${id}/time`, timeData);
  return response.data;
};

export const getAllTimeLogs = async () => {
  const response = await api.get('/projects/time/all');
  return response.data;
};
