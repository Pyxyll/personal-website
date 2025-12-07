'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, Project } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';
import { Badge } from '@/components/ui/badge';

export default function AdminProjectsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.adminGetAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsApi.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'border-green-500 text-green-500',
    completed: 'border-blue-500 text-blue-500',
    wip: 'border-yellow-500 text-yellow-500',
    archived: 'border-gray-500 text-gray-500',
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border border-border bg-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground">
                Manage your projects
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
                href="/admin/projects/new"
                className="text-sm border border-foreground px-3 py-1 text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                [New Project]
              </Link>
            </div>
          </div>
        </header>

        <div className="border border-border bg-card p-4 mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
          />
        </div>

        {isLoadingProjects ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {search ? 'No projects match your search.' : 'No projects yet.'}
            </p>
            <Link
              href="/admin/projects/new"
              className="inline-block mt-4 text-foreground hover:underline"
            >
              [Create your first project]
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="border border-border bg-card p-4 hover:border-foreground transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-foreground font-medium truncate">
                        {project.title}
                      </h3>
                      <Badge variant="outline" className={`text-xs ${statusColors[project.status] || ''}`}>
                        {project.status}
                      </Badge>
                      {project.featured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>/{project.slug}</span>
                      {project.category && <span>{project.category}</span>}
                      {project.github_url && <span>[GitHub]</span>}
                      {project.demo_url && <span>[Demo]</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      [Edit]
                    </Link>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-muted-foreground hover:text-foreground"
                      target="_blank"
                    >
                      [View]
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
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
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
