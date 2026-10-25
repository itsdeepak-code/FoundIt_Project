import { api } from './client.js';

// Builds multipart form data so an optional image can be sent with the listing.
function toFormData(values) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined) continue;
    formData.append(key, typeof value === 'boolean' ? String(value) : value);
  }
  return formData;
}

export const itemsApi = {
  list: (params) => api.get('/items', { params }).then((res) => res.data.data),
  mine: () => api.get('/items/mine').then((res) => res.data.data.items),
  get: (id) => api.get(`/items/${id}`).then((res) => res.data.data),
  create: (values) => api.post('/items', toFormData(values)).then((res) => res.data),
  update: (id, values) => api.patch(`/items/${id}`, toFormData(values)).then((res) => res.data),
  remove: (id) => api.delete(`/items/${id}`).then((res) => res.data),
  close: (id) => api.patch(`/items/${id}/close`).then((res) => res.data),
  markRecovered: (id) => api.patch(`/items/${id}/recovered`).then((res) => res.data),
};
