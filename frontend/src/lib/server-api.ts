// Server-side API functions for metadata generation
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  published_at: string | null;
  read_time: string | null;
}

export async function getPostBySlug(slug: string): Promise<BlogPostMeta | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${slug}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const posts = await response.json();
    return posts.map((post: { slug: string }) => post.slug);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}
