import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Types
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  status: 'active' | 'completed' | 'wip' | 'archived';
  github_url: string | null;
  demo_url: string | null;
  category: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  read_time: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NowUpdate {
  id: number;
  location: string | null;
  status: string;
  working_on: string[];
  learning: string[];
  reading: string[];
  watching: string[];
  goals: string[];
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Projects API
export const projectsApi = {
  getAll: async (params?: {
    featured?: boolean;
    category?: string;
    status?: string;
  }): Promise<Project[]> => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Project> => {
    const response = await api.get(`/projects/${slug}`);
    return response.data;
  },

  // Admin methods
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
  getAll: async (params?: {
    featured?: boolean;
    tag?: string;
    search?: string;
  }): Promise<BlogPost[]> => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get(`/posts/${slug}`);
    return response.data;
  },

  getTags: async (): Promise<string[]> => {
    const response = await api.get('/posts/tags');
    return response.data;
  },

  // Admin methods
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
  getCurrent: async (): Promise<NowUpdate | null> => {
    const response = await api.get('/now');
    return response.data;
  },

  getHistory: async (): Promise<NowUpdate[]> => {
    const response = await api.get('/now/history');
    return response.data;
  },

  // Admin methods
  adminGetAll: async (): Promise<NowUpdate[]> => {
    const response = await api.get('/admin/now');
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

export default api;
