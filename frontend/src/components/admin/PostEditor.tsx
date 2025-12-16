'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { postsApi, imagesApi, linkedinApi, BlogPost } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';
import { ImageUpload } from './ImageUpload';

interface PostEditorProps {
  post?: BlogPost;
  isNew?: boolean;
}

export function PostEditor({ post, isNew = false }: PostEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDraggingContent, setIsDraggingContent] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    description: post?.description || '',
    content: post?.content || '',
    featured_image: post?.featured_image || '',
    featured_image_alt: post?.featured_image_alt || '',
    tags: post?.tags?.join(', ') || '',
    read_time: post?.read_time || '',
    featured: post?.featured || false,
    published: post?.published || false,
    published_at: post?.published_at
      ? new Date(post.published_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    post_to_linkedin: post?.post_to_linkedin || false,
  });

  useEffect(() => {
    const checkLinkedInStatus = async () => {
      try {
        const status = await linkedinApi.getStatus();
        setLinkedInConnected(status.connected);
      } catch {
        setLinkedInConnected(false);
      }
    };
    checkLinkedInStatus();
  }, []);

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

  const handleContentDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingContent(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const textarea = contentRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;

    try {
      const response = await imagesApi.upload(file, 'content');
      const markdownImage = '![](' + response.url + ')';

      setFormData((prev) => {
        const before = prev.content.substring(0, cursorPos);
        const after = prev.content.substring(cursorPos);
        return { ...prev, content: before + markdownImage + '\n' + after };
      });
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  }, []);

  const handleContentDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingContent(true);
    }
  }, []);

  const handleContentDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingContent(false);
  }, []);

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
        featured_image: formData.featured_image || null,
        featured_image_alt: formData.featured_image_alt || null,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        read_time: formData.read_time || null,
        featured: formData.featured,
        published: formData.published,
        published_at: formData.published ? formData.published_at : null,
        post_to_linkedin: linkedInConnected ? formData.post_to_linkedin : false,
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
            <h2 className="text-foreground mb-3">Featured Image</h2>
            <AsciiDivider className="mb-4" />

            <div className="space-y-4">
              <ImageUpload
                currentImage={formData.featured_image}
                onUpload={(url) =>
                  setFormData((prev) => ({ ...prev, featured_image: url }))
                }
                type="featured"
                label="Featured Image (500x500)"
              />

              {formData.featured_image && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.featured_image_alt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featured_image_alt: e.target.value,
                      }))
                    }
                    placeholder="Describe the image for accessibility"
                    className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <h2 className="text-foreground mb-3">Content</h2>
            <AsciiDivider className="mb-4" />

            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Content (Markdown) * - Drag images to embed
              </label>
              <textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                onDrop={handleContentDrop}
                onDragOver={handleContentDragOver}
                onDragLeave={handleContentDragLeave}
                rows={20}
                className={`w-full bg-background border p-2 text-foreground focus:outline-none font-mono text-sm resize-y transition-colors ${
                  isDraggingContent
                    ? 'border-foreground bg-foreground/5'
                    : 'border-border focus:border-foreground'
                }`}
                required
              />
              {isDraggingContent && (
                <div className="text-sm text-muted-foreground mt-1">
                  Drop image to embed at cursor position
                </div>
              )}
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

                {linkedInConnected && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.post_to_linkedin}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          post_to_linkedin: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-foreground"
                    />
                    <span className="text-muted-foreground">Post to LinkedIn</span>
                  </label>
                )}
              </div>

              {linkedInConnected && formData.post_to_linkedin && (
                <p className="text-xs text-muted-foreground">
                  A preview will be shown before posting to LinkedIn when published.
                </p>
              )}

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
