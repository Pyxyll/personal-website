'use client';

import { useState, useEffect } from 'react';
import { AsciiSection, AsciiProjectCard, AsciiDivider, AsciiLoader } from "@/components/ascii";
import { projectsApi, Project } from '@/lib/api';

const categories = [
  { id: "all", label: "all" },
  { id: "web", label: "web" },
  { id: "backend", label: "backend" },
  { id: "tools", label: "tools" }
];

const statuses = [
  { id: "all", label: "all" },
  { id: "active", label: "active" },
  { id: "completed", label: "completed" },
  { id: "wip", label: "wip" },
  { id: "archived", label: "archived" }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const categoryMatch = selectedCategory === "all" || project.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || project.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <div className="space-y-8">
      <section className="border border-border p-4 bg-card">
        <h1 className="text-foreground text-xl mb-2">Projects</h1>
        <p className="text-muted-foreground">
          A collection of my open source projects, side projects, and experiments.
          Most are available on GitHub.
        </p>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <span className="text-muted-foreground text-sm mr-2">category:</span>
            <div className="inline-flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  [{cat.label}]
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-sm mr-2">status:</span>
            <div className="inline-flex flex-wrap gap-1">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-2 py-1 text-sm transition-colors ${
                    selectedStatus === status.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  [{status.label}]
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <AsciiLoader text="Loading projects" />
      ) : (
        <>
          {featuredProjects.length > 0 && (
            <>
              <AsciiSection title="Featured">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featuredProjects.map((project) => (
                    <AsciiProjectCard
                      key={project.id}
                      title={project.title}
                      description={project.description}
                      href={`/projects/${project.slug}`}
                      tags={project.tags || []}
                      status={project.status}
                      github={project.github_url || undefined}
                      demo={project.demo_url || undefined}
                    />
                  ))}
                </div>
              </AsciiSection>
              <AsciiDivider />
            </>
          )}

          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <AsciiProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                href={`/projects/${project.slug}`}
                tags={project.tags || []}
                status={project.status}
                github={project.github_url || undefined}
                demo={project.demo_url || undefined}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="border border-border p-8 text-center text-muted-foreground">
              {projects.length === 0
                ? "No projects yet. Check back soon!"
                : "No projects found matching the selected filters."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
