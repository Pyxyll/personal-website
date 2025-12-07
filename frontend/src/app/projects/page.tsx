'use client';

import { useState } from 'react';
import { AsciiSection, AsciiProjectCard, AsciiDivider } from "@/components/ascii";

const projects = [
  {
    title: "Project Alpha",
    description: "A full-stack web application built with Next.js and Laravel. Features real-time updates, authentication, and a modern dashboard UI.",
    tags: ["nextjs", "laravel", "postgresql", "websockets", "tailwind"],
    status: "active" as const,
    github: "https://github.com/dylancollins/project-alpha",
    demo: "https://alpha.dylancollins.dev",
    featured: true,
    category: "web"
  },
  {
    title: "CLI Toolkit",
    description: "Command-line utility for automating development workflows. Written in Rust for maximum performance. Includes project scaffolding, code generation, and deployment tools.",
    tags: ["rust", "cli", "automation", "developer-tools"],
    status: "completed" as const,
    github: "https://github.com/dylancollins/cli-toolkit",
    featured: true,
    category: "tools"
  },
  {
    title: "ASCII Generator",
    description: "Convert images to ASCII art with customizable settings. Supports multiple output formats including HTML, ANSI, and plain text.",
    tags: ["python", "image-processing", "ascii", "opencv"],
    status: "wip" as const,
    github: "https://github.com/dylancollins/ascii-gen",
    featured: true,
    category: "tools"
  },
  {
    title: "Blog Engine",
    description: "A minimalist blog engine with Markdown support, syntax highlighting, and RSS feed generation. Built for speed and simplicity.",
    tags: ["go", "markdown", "sqlite", "htmx"],
    status: "completed" as const,
    github: "https://github.com/dylancollins/blog-engine",
    demo: "https://blog-demo.dylancollins.dev",
    category: "web"
  },
  {
    title: "API Gateway",
    description: "A lightweight API gateway with rate limiting, authentication, and request/response transformation capabilities.",
    tags: ["nodejs", "express", "redis", "jwt"],
    status: "completed" as const,
    github: "https://github.com/dylancollins/api-gateway",
    category: "backend"
  },
  {
    title: "Task Queue",
    description: "A distributed task queue system for background job processing. Supports delayed jobs, retries, and dead letter queues.",
    tags: ["python", "celery", "rabbitmq", "docker"],
    status: "active" as const,
    github: "https://github.com/dylancollins/task-queue",
    category: "backend"
  },
  {
    title: "UI Component Library",
    description: "A collection of accessible, customizable React components with TypeScript support. Includes documentation and Storybook integration.",
    tags: ["react", "typescript", "storybook", "testing-library"],
    status: "archived" as const,
    github: "https://github.com/dylancollins/ui-components",
    demo: "https://ui.dylancollins.dev",
    category: "web"
  },
  {
    title: "Git Stats",
    description: "Generate beautiful visualizations of your Git contribution history. Export as SVG or PNG for use in README files.",
    tags: ["typescript", "d3js", "git", "svg"],
    status: "completed" as const,
    github: "https://github.com/dylancollins/git-stats",
    category: "tools"
  },
  {
    title: "Dotfiles",
    description: "My personal development environment configuration. Includes Neovim, tmux, zsh, and various CLI tool configs.",
    tags: ["shell", "lua", "vim", "dotfiles"],
    status: "active" as const,
    github: "https://github.com/dylancollins/dotfiles",
    category: "tools"
  },
  {
    title: "Weather CLI",
    description: "A terminal weather app with ASCII art weather icons. Supports multiple locations and forecast data.",
    tags: ["go", "cli", "api", "ascii-art"],
    status: "completed" as const,
    github: "https://github.com/dylancollins/weather-cli",
    category: "tools"
  }
];

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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

      <AsciiSection title="Featured">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <AsciiProjectCard key={project.title} {...project} />
          ))}
        </div>
      </AsciiSection>

      <AsciiDivider />

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

        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <AsciiProjectCard key={project.title} {...project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="border border-border p-8 text-center text-muted-foreground">
            No projects found matching the selected filters.
          </div>
        )}
      </section>

      <section className="border border-border p-4 bg-card">
        <p className="text-muted-foreground">
          Find more projects and contributions on my{" "}
          <a
            href="https://github.com/dylancollins"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            GitHub profile
          </a>
          .
        </p>
      </section>
    </div>
  );
}
