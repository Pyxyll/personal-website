'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AsciiDivider, AsciiPageLoader } from "@/components/ascii";
import { Badge } from "@/components/ui/badge";
import { projectsApi, Project } from "@/lib/api";

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProject();
    }
  }, [slug]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getBySlug(slug);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabels = {
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
    wip: 'Work in Progress'
  };

  const statusColors = {
    active: 'text-green-400',
    completed: 'text-blue-400',
    archived: 'text-gray-400',
    wip: 'text-amber-400'
  };

  if (isLoading) {
    return <AsciiPageLoader text="Loading project" />;
  }

  if (error || !project) {
    return (
      <div className="space-y-8">
        <section className="border border-border p-6 bg-card text-center">
          <h1 className="text-foreground text-xl mb-4">404: Project Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested project could not be found.
          </p>
          <Link href="/projects" className="text-foreground hover:underline">
            [Back to Projects]
          </Link>
        </section>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      <header className="border border-border p-6 bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/projects" className="hover:text-foreground">projects</Link>
          <span>/</span>
          <span className="text-foreground">{slug}</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl text-foreground font-bold">{project.title}</h1>
          {project.status && (
            <span className={`text-sm ${statusColors[project.status]}`}>
              [{statusLabels[project.status]}]
            </span>
          )}
        </div>

        <p className="text-muted-foreground mb-4">{project.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {project.category && (
            <span className="text-muted-foreground">
              Category: <span className="text-foreground">{project.category}</span>
            </span>
          )}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      <AsciiDivider />

      {(project.github_url || project.demo_url) && (
        <>
          <section className="border border-border p-6 bg-card">
            <h2 className="text-foreground font-bold mb-4">Links</h2>
            <div className="flex flex-wrap gap-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-[var(--gradient-mid)] transition-colors"
                >
                  [View Source on GitHub]
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-[var(--gradient-mid)] transition-colors"
                >
                  [View Live Demo]
                </a>
              )}
            </div>
          </section>

          <AsciiDivider />
        </>
      )}

      <footer className="flex items-center justify-between border border-border p-4 bg-card">
        <Link href="/projects" className="text-foreground hover:underline">
          [Back to Projects]
        </Link>
        {project.featured && (
          <span className="text-xs text-[var(--gradient-mid)]">[Featured Project]</span>
        )}
      </footer>
    </article>
  );
}
