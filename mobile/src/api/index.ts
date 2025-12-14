import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { User, Project, BlogPost, NowUpdate, ContactSubmission } from '../types';

// Update this to your API URL
const API_BASE_URL = 'https://api.dylancollins.me/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  adminGetAll: async (params?: { search?: string }): Promise<Project[]> => {
    const response = await api.get('/admin/projects', { params });
    return response.data;
  },

  adminGetById: async (id: number): Promise<Project> => {
    const response = await api.get(`/admin/projects/${id}`);
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Blog Posts API
export const postsApi = {
  adminGetAll: async (params?: { search?: string }): Promise<BlogPost[]> => {
    const response = await api.get('/admin/posts', { params });
    return response.data;
  },

  adminGetById: async (id: number): Promise<BlogPost> => {
    const response = await api.get(`/admin/posts/${id}`);
    return response.data;
  },

  create: async (data: Partial<BlogPost>): Promise<BlogPost> => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  update: async (id: number, data: Partial<BlogPost>): Promise<BlogPost> => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};

// Now Updates API
export const nowApi = {
  adminGetAll: async (): Promise<NowUpdate[]> => {
    const response = await api.get('/admin/now');
    return response.data;
  },

  getCurrent: async (): Promise<NowUpdate | null> => {
    const response = await api.get('/now');
    return response.data;
  },

  create: async (data: Partial<NowUpdate>): Promise<NowUpdate> => {
    const response = await api.post('/now', data);
    return response.data;
  },

  update: async (id: number, data: Partial<NowUpdate>): Promise<NowUpdate> => {
    const response = await api.put(`/now/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/now/${id}`);
  },
};

// Contact Submissions API
export const contactApi = {
  getAll: async (params?: { unread?: boolean }): Promise<ContactSubmission[]> => {
    const response = await api.get('/admin/contact', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ContactSubmission> => {
    const response = await api.get(`/admin/contact/${id}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/admin/contact/unread-count');
    return response.data;
  },

  markRead: async (id: number): Promise<ContactSubmission> => {
    const response = await api.patch(`/admin/contact/${id}/read`);
    return response.data;
  },

  markUnread: async (id: number): Promise<ContactSubmission> => {
    const response = await api.patch(`/admin/contact/${id}/unread`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/contact/${id}`);
  },
};

export default api;
