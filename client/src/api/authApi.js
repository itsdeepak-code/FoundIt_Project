import { api } from './client.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
  login: (data) => api.post('/auth/login', data).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data.data.user),
};
