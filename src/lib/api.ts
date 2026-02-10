// Use proxy in development, or direct URL if specified
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api');

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Baby API
export const babyAPI = {
  getAll: () => apiRequest('/babies'),
  create: (data: any) => apiRequest('/babies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiRequest(`/babies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/babies/${id}`, { method: 'DELETE' }),
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 3000.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    role: 'parent' | 'practitioner';
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    babyName?: string;
    specialization?: string;
    licenseNumber?: string;
    qualification?: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Health Log API
export const healthLogAPI = {
  getAll: (babyId?: string) => {
    const qs = babyId ? `?babyId=${babyId}` : '';
    return apiRequest(`/health-logs${qs}`);
  },
  create: (data: {
    babyId?: string;
    babyName?: string;
    weight?: number;
    height?: number;
    temperature?: number;
    sleepHours?: number;
    feeding?: string;
    symptoms?: string;
    notes?: string;
  }) => apiRequest('/health-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/health-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/health-logs/${id}`, {
    method: 'DELETE',
  }),
};

// Vaccination API
export const vaccinationAPI = {
  getAll: (babyId?: string) => {
    const qs = babyId ? `?babyId=${babyId}` : '';
    return apiRequest(`/vaccinations${qs}`);
  },
  create: (data: {
    babyId?: string;
    babyName?: string;
    name: string;
    description?: string;
    dueDate: string;
    completedDate?: string;
    status?: 'pending' | 'completed' | 'overdue';
  }) => apiRequest('/vaccinations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/vaccinations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/vaccinations/${id}`, {
    method: 'DELETE',
  }),
};

// Query API
export const queryAPI = {
  getAll: (status?: string, babyId?: string) => {
    let qs = status ? `?status=${status}` : '';
    if (babyId) qs += `${qs ? '&' : '?'}babyId=${babyId}`;
    return apiRequest(`/queries${qs}`);
  },
  create: (data: {
    babyId?: string;
    question: string;
    category?: string;
    attachments?: string[];
  }) => apiRequest('/queries', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  respond: (id: string, response: string) => apiRequest(`/queries/${id}/respond`, {
    method: 'PUT',
    body: JSON.stringify({ response }),
  }),
  update: (id: string, data: any) => apiRequest(`/queries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/queries/${id}`, {
    method: 'DELETE',
  }),
};

// Alert API
export const alertAPI = {
  getAll: () => apiRequest('/alerts'),
  markRead: (id: string) => apiRequest(`/alerts/${id}/read`, { method: 'PUT' }),
};

// Report API
export const reportAPI = {
  getAll: () => apiRequest('/reports'),
  getSummary: (babyId: string) => apiRequest(`/reports/summary/${babyId}`),
  create: (data: any) => apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// User API
export const userAPI = {
  getProfile: () => apiRequest('/users/profile'),
  updateProfile: (data: any) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAccount: () => apiRequest('/users/profile', {
    method: 'DELETE',
  }),
};

// Expert Content API
export const contentAPI = {
  getAll: (params?: { status?: 'pending' | 'approved' | 'rejected' }) => {
    const qs = params?.status ? `?status=${encodeURIComponent(params.status)}` : '';
    return apiRequest(`/content${qs}`);
  },
  getById: (id: string, opts?: { view?: boolean }) => {
    const qs = opts?.view ? '?view=1' : '';
    return apiRequest(`/content/${encodeURIComponent(id)}${qs}`);
  },
  create: (data: { title: string; description: string; body: string }) =>
    apiRequest('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<{ title: string; description: string; body: string }>) =>
    apiRequest(`/content/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  publish: (id: string) =>
    apiRequest(`/content/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
    }),
  approve: (id: string) =>
    apiRequest(`/content/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
    }),
  reject: (id: string) =>
    apiRequest(`/content/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
    }),
  delete: (id: string) =>
    apiRequest(`/content/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

// Admin API
export const adminAPI = {
  getPractitioners: () => apiRequest('/admin/practitioners'),
  verifyPractitioner: (id: string, status: 'pending' | 'verified' | 'rejected') =>
    apiRequest(`/admin/practitioners/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deletePractitioner: (id: string) =>
    apiRequest(`/admin/practitioners/${id}`, {
      method: 'DELETE',
    }),
  getContent: () => apiRequest('/admin/content'),
  getDetailedUsers: () => apiRequest('/admin/detailed-users'),
  getQueries: () => apiRequest('/admin/queries'),
  approveQuery: (id: string) => apiRequest(`/queries/${id}/approve`, {
    method: 'PUT',
  }),
};

// Global Vaccine API
export const globalVaccineAPI = {
  getAll: () => apiRequest('/global-vaccines'),
  create: (data: any) => apiRequest('/global-vaccines', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/global-vaccines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/global-vaccines/${id}`, {
    method: 'DELETE',
  }),
};
