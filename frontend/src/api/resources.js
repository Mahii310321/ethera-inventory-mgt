import { api } from './client';

export const productsApi = {
  list: (params = {}) => api.get('/products', { params }).then((res) => res.data),
  create: (payload) => api.post('/products', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/products/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/products/${id}`),
};

export const customersApi = {
  list: (params = {}) => api.get('/customers', { params }).then((res) => res.data),
  create: (payload) => api.post('/customers', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/customers/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/customers/${id}`),
};

export const ordersApi = {
  list: (params = {}) => api.get('/orders', { params }).then((res) => res.data),
  create: (payload) => api.post('/orders', payload).then((res) => res.data),
};

export const inventoryApi = {
  list: () => api.get('/inventory').then((res) => res.data),
};

