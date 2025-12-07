'use client';

import { useState, useEffect } from 'react';
import { AsciiLogo, AsciiSection, AsciiProjectCard, AsciiBlogCard } from "@/components/ascii";
import Link from "next/link";
import { postsApi, nowApi, projectsApi, BlogPost, NowUpdate, Project } from "@/lib/api";

// Fallback data for when API is unavailable
const fallbackProjects = [
  {
    title: "Project Alpha",
    description: "A full-stack web application built with Next.js and Laravel. Features real-time updates and a modern UI.",
    tags: ["nextjs", "laravel", "postgresql"],
    status: "active" as const,
    github: "https://github.com/dylancollins/project-alpha",
    demo: "https://alpha.dylancollins.dev"
  },
  {
    title: "CLI Tool",
    description: "Command-line utility for automating development workflows. Written in Rust for maximum performance.",
    tags: ["rust", "cli", "automation"],
    status: "completed" as const,
    github: "https://github.com/dylancollins/cli-tool",
  },
  {
    title: "ASCII Generator",
    description: "Convert images to ASCII art with customizable settings. Supports multiple output formats.",
    tags: ["python", "image-processing", "ascii"],
    status: "wip" as const,
    github: "https://github.com/dylancollins/ascii-gen",
  }
];

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [nowData, setNowData] = useState<NowUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsData, nowResult, projectsData] = await Promise.allSettled([
        postsApi.getAll(),
        nowApi.getCurrent(),
        projectsApi.getAll({ featured: true }),
      ]);

      if (postsData.status === 'fulfilled') {
        setPosts(postsData.value.slice(0, 4));
      }
      if (nowResult.status === 'fulfilled') {
        setNowData(nowResult.value);
      }
      if (projectsData.status === 'fulfilled') {
        setProjects(projectsData.value.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use API projects or fallback
  const displayProjects = projects.length > 0 ? projects : fallbackProjects;

  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <div className="flex justify-center mb-6 overflow-x-auto">
          <AsciiLogo />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Welcome to my corner of the internet. I build things, write about technology,
          and share what I learn along the way.
        </p>
      </section>

      <section className="border border-border p-6 bg-card card-hover">
        <h3 className="text-foreground mb-2 flex items-center gap-2">
          <span className="text-[var(--gradient-mid)]">&gt;</span> About
        </h3>
        <div className="text-muted-foreground">
          <p>Software developer passionate about clean code and elegant solutions.</p>
          <p className="mt-2">
            Currently focused on full-stack development, open source, and developer tools.
          </p>
        </div>
        <div className="mt-4 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline">
            Learn more about me -&gt;
          </Link>
        </div>
      </section>

      <AsciiSection title="Featured Projects">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => (
            <AsciiProjectCard
              key={project.title}
              title={project.title}
              description={project.description}
              tags={project.tags || []}
              status={project.status}
              github={'github_url' in project ? project.github_url || undefined : project.github}
              demo={'demo_url' in project ? project.demo_url || undefined : project.demo}
            />
          ))}
        </div>
        <div className="mt-4 text-right">
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline">
            View all projects -&gt;
          </Link>
        </div>
      </AsciiSection>

      <AsciiSection title="Recent Posts">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border p-4 bg-card">
                <div className="h-4 w-3/4 bg-muted shimmer mb-2" />
                <div className="h-3 w-full bg-muted shimmer mb-1" />
                <div className="h-3 w-2/3 bg-muted shimmer" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <AsciiBlogCard
                key={post.slug}
                title={post.title}
                description={post.description}
                date={post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : ''}
                tags={post.tags || []}
                readTime={post.read_time || undefined}
                href={`/blog/${post.slug}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        )}
        <div className="mt-4 text-right">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline">
            Read all posts -&gt;
          </Link>
        </div>
      </AsciiSection>

      <section className="border border-border p-6 bg-card card-hover">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-foreground flex items-center gap-2">
            <span className="text-[var(--gradient-mid)]">~</span> What I&apos;m doing now
          </h3>
          {nowData && (
            <span className="text-xs text-muted-foreground">
              [updated: {new Date(nowData.updated_at).toLocaleDateString()}]
            </span>
          )}
        </div>
        {nowData && nowData.working_on && nowData.working_on.length > 0 ? (
          <ul className="text-muted-foreground text-sm space-y-1">
            {nowData.working_on.slice(0, 3).map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-[var(--gradient-mid)]">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Currently working on various projects. Check the /now page for more details!
          </p>
        )}
        <div className="mt-3 text-right">
          <Link href="/now" className="text-sm text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline">
            Full /now page -&gt;
          </Link>
        </div>
      </section>

      <section className="text-center border border-border p-8 bg-card card-hover">
        <p className="text-muted-foreground mb-4">
          Have a question or want to work together?
        </p>
        <a
          href="mailto:hello@dylancollins.dev"
          className="btn-modern inline-block px-6 py-2 text-foreground no-underline"
        >
          [Send me a message]
        </a>
      </section>
    </div>
  );
}
