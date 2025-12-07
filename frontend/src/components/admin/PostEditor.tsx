'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { postsApi, BlogPost } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';

interface PostEditorProps {
  post?: BlogPost;
  isNew?: boolean;
}

export function PostEditor({ post, isNew = false }: PostEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    description: post?.description || '',
    content: post?.content || '',
    tags: post?.tags?.join(', ') || '',
    read_time: post?.read_time || '',
    featured: post?.featured || false,
    published: post?.published || false,
    published_at: post?.published_at
      ? new Date(post.published_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isNew && !prev.slug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        content: formData.content,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        read_time: formData.read_time || null,
        featured: formData.featured,
        published: formData.published,
        published_at: formData.published ? formData.published_at : null,
      };

      if (isNew) {
        await postsApi.create(data);
      } else if (post) {
        await postsApi.update(post.id, data);
      }

      router.push('/admin/posts');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border border-border bg-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-foreground">
                {isNew ? 'New Post' : 'Edit Post'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isNew ? 'Create a new blog post' : `Editing: ${post?.title}`}
              </p>
            </div>
            <Link
              href="/admin/posts"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              [Back to Posts]
            </Link>
          </div>
        </header>

        {error && (
          <div className="border border-red-500 bg-red-500/10 p-3 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-border bg-card p-4">
            <h2 className="text-foreground mb-3">Basic Info</h2>
            <AsciiDivider className="mb-4" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    placeholder="web-dev, nextjs, tutorial"
                    className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        read_time: e.target.value,
                      }))
                    }
                    placeholder="5 min"
                    className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <h2 className="text-foreground mb-3">Content</h2>
            <AsciiDivider className="mb-4" />

            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Content (Markdown) *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={20}
                className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground font-mono text-sm resize-y"
                required
              />
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <h2 className="text-foreground mb-3">Publishing</h2>
            <AsciiDivider className="mb-4" />

            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        published: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-foreground"
                  />
                  <span className="text-muted-foreground">Published</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-foreground"
                  />
                  <span className="text-muted-foreground">Featured</span>
                </label>
              </div>

              {formData.published && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        published_at: e.target.value,
                      }))
                    }
                    className="bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/posts"
              className="text-muted-foreground hover:text-foreground"
            >
              [Cancel]
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="border border-foreground bg-foreground text-background px-6 py-2 hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : isNew
                ? '[Create Post]'
                : '[Save Changes]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
