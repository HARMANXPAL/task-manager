import axios from 'axios';

const api = axios.create({
  // In production, frontend is served by the same Express server so /api works.
  // In dev, Vite proxies /api → localhost:5001.
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const logout   = ()     => api.post('/auth/logout');
export const getMe    = ()     => api.get('/auth/me');

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const getTasks   = (params)    => api.get('/tasks', { params });
export const getTask    = (id)        => api.get(`/tasks/${id}`);
export const createTask = (data)      => api.post('/tasks', data);
export const updateTask = (id, data)  => api.put(`/tasks/${id}`, data);
export const deleteTask = (id)        => api.delete(`/tasks/${id}`);
export const getStats   = ()          => api.get('/tasks/stats');
export const getActivity= ()          => api.get('/tasks/activity');
export const exportCSV  = ()          => api.get('/tasks/export', { responseType: 'blob' });

export default api;
