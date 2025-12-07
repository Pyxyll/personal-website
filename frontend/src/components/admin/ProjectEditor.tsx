'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectsApi, Project } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';

interface ProjectEditorProps {
  project?: Project;
  isNew?: boolean;
}

export function ProjectEditor({ project, isNew = false }: ProjectEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: project?.title || '',
    slug: project?.slug || '',
    description: project?.description || '',
    tags: project?.tags?.join(', ') || '',
    status: project?.status || 'wip',
    github_url: project?.github_url || '',
    demo_url: project?.demo_url || '',
    category: project?.category || '',
    featured: project?.featured || false,
    sort_order: project?.sort_order || 0,
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
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status: formData.status as 'active' | 'completed' | 'wip' | 'archived',
        github_url: formData.github_url || null,
        demo_url: formData.demo_url || null,
        category: formData.category || null,
        featured: formData.featured,
        sort_order: formData.sort_order,
      };

      if (isNew) {
        await projectsApi.create(data);
      } else if (project) {
        await projectsApi.update(project.id, data);
      }

      router.push('/admin/projects');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save project');
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
                {isNew ? 'New Project' : 'Edit Project'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isNew ? 'Create a new project' : `Editing: ${project?.title}`}
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              [Back to Projects]
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
                  rows={4}
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="e.g. Web App, CLI Tool, Library"
                    className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                  >
                    <option value="wip">Work in Progress</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

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
                  placeholder="react, typescript, nextjs"
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <h2 className="text-foreground mb-3">Links</h2>
            <AsciiDivider className="mb-4" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, github_url: e.target.value }))
                  }
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for private/commercial projects
                </p>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Demo URL
                </label>
                <input
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, demo_url: e.target.value }))
                  }
                  placeholder="https://myproject.com"
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <h2 className="text-foreground mb-3">Display Options</h2>
            <AsciiDivider className="mb-4" />

            <div className="space-y-4">
              <div className="flex items-center gap-6">
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
                  <span className="text-muted-foreground">Featured Project</span>
                </label>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sort_order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-32 bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/projects"
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
                ? '[Create Project]'
                : '[Save Changes]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
