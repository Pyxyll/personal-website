'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { postsApi, BlogPost } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';
import { Badge } from '@/components/ui/badge';

export default function AdminPostsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  const loadPosts = async () => {
    try {
      const data = await postsApi.adminGetAll();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsApi.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border border-border bg-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-foreground">Blog Posts</h1>
              <p className="text-sm text-muted-foreground">
                Manage your blog posts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                [Dashboard]
              </Link>
              <Link
                href="/admin/posts/new"
                className="text-sm border border-foreground px-3 py-1 text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                [New Post]
              </Link>
            </div>
          </div>
        </header>

        <div className="border border-border bg-card p-4 mb-6">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
          />
        </div>

        {isLoadingPosts ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {search ? 'No posts match your search.' : 'No posts yet.'}
            </p>
            <Link
              href="/admin/posts/new"
              className="inline-block mt-4 text-foreground hover:underline"
            >
              [Create your first post]
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="border border-border bg-card p-4 hover:border-foreground transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-foreground font-medium truncate">
                        {post.title}
                      </h3>
                      {!post.published && (
                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
                          Draft
                        </Badge>
                      )}
                      {post.featured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>/{post.slug}</span>
                      {post.published_at && (
                        <span>
                          Published: {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      [Edit]
                    </Link>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-muted-foreground hover:text-foreground"
                      target="_blank"
                    >
                      [View]
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      [Delete]
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
