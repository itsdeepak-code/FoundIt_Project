import { api } from './client.js';

export const claimsApi = {
  submit: (itemId, data) => api.post(`/items/${itemId}/claims`, data).then((res) => res.data),
  forItem: (itemId) => api.get(`/items/${itemId}/claims`).then((res) => res.data.data.claims),
  mine: () => api.get('/claims/mine').then((res) => res.data.data.claims),
  get: (id) => api.get(`/claims/${id}`).then((res) => res.data.data.claim),
  decide: (id, decision, reviewNote = '') =>
    api.patch(`/claims/${id}/decision`, { decision, reviewNote }).then((res) => res.data),
  complete: (id) => api.patch(`/claims/${id}/complete`).then((res) => res.data),
};
