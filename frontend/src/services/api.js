// src/services/api.js
// Production REST API client for AxoimIQQI Subscription Management Backend

const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('AxoimIQqi_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `HTTP ${response.status}: Request failed`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    getMe: () => request('/auth/me'),
  },

  // Customers
  customers: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/customers${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/customers/${id}`),
    create: (data) => request('/customers', { method: 'POST', body: data }),
    update: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },

  // Products & Variants
  products: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/products${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: data }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
    addVariant: (id, variantData) => request(`/products/${id}/variants`, { method: 'POST', body: variantData }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  // Subscription Plans
  plans: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/plans${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/plans/${id}`),
    create: (data) => request('/plans', { method: 'POST', body: data }),
    update: (id, data) => request(`/plans/${id}`, { method: 'PUT', body: data }),
  },

  // Quotations
  quotations: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/quotations${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/quotations/${id}`),
    create: (data) => request('/quotations', { method: 'POST', body: data }),
    convertToSubscription: (id) => request(`/quotations/${id}/convert`, { method: 'POST' }),
  },

  // Subscriptions
  subscriptions: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/subscriptions${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/subscriptions/${id}`),
    create: (data) => request('/subscriptions', { method: 'POST', body: data }),
    updateStatus: (id, status, reason) => request(`/subscriptions/${id}/status`, { method: 'PATCH', body: { status, reason } }),
    renew: (id, durationMonths) => request(`/subscriptions/${id}/renew`, { method: 'POST', body: { durationMonths } }),
  },

  // Billing Center
  billing: {
    preview: (targetDate) => request(`/billing/preview${targetDate ? `?targetDate=${targetDate}` : ''}`),
    execute: (targetDate) => request('/billing/execute', { method: 'POST', body: { targetDate } }),
    getRuns: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/billing/runs${q ? `?${q}` : ''}`);
    },
    getRunById: (id) => request(`/billing/runs/${id}`),
  },

  // Invoices
  invoices: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/invoices${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/invoices/${id}`),
    updateStatus: (id, status) => request(`/invoices/${id}/status`, { method: 'PATCH', body: { status } }),
  },

  // Payments
  payments: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/payments${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/payments/${id}`),
    register: (data) => request('/payments/register', { method: 'POST', body: data }),
  },

  // Discounts
  discounts: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/discounts${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/discounts/${id}`),
    create: (data) => request('/discounts', { method: 'POST', body: data }),
    validate: (code, amount, quantity, productId) =>
      request('/discounts/validate', { method: 'POST', body: { code, amount, quantity, productId } }),
  },

  // Staff (Admin Only)
  staff: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/staff${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/staff/${id}`),
    create: (data) => request('/staff', { method: 'POST', body: data }),
    assignCustomers: (id, customerIds) =>
      request(`/staff/${id}/assign-customers`, { method: 'POST', body: { customerIds } }),
  },

  // Analytics & Dashboard KPIs
  analytics: {
    getDashboardKpis: () => request('/analytics/dashboard'),
    getRevenueTrends: () => request('/analytics/revenue-trends'),
    getRevenueRisk: () => request('/analytics/revenue-risk'),
  },

  // Customer Self-Service Portal
  portal: {
    getDashboard: () => request('/portal/dashboard'),
    getSubscriptions: () => request('/portal/subscriptions'),
    getInvoices: () => request('/portal/invoices'),
    getPayments: () => request('/portal/payments'),
    requestRenewal: (subscriptionId, durationMonths, notes) =>
      request('/portal/renewals', { method: 'POST', body: { subscriptionId, durationMonths, notes } }),
  },
};

export default api;
