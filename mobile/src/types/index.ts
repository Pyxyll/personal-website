export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

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
  featured_image: string | null;
  featured_image_alt: string | null;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadResponse {
  webp: string;
  jpeg: string;
  url: string;
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

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}
