import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send HTTP-only cookies on every request
  headers: { 'Content-Type': 'application/json' }
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register  = (data) => api.post('/auth/register', data);
export const login     = (data) => api.post('/auth/login', data);
export const logout    = ()     => api.post('/auth/logout');
export const getMe     = ()     => api.get('/auth/me');

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const getTasks  = (params) => api.get('/tasks', { params });
export const getTask   = (id)     => api.get(`/tasks/${id}`);
export const createTask = (data)  => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id)    => api.delete(`/tasks/${id}`);

export default api;
