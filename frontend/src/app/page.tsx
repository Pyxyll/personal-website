'use client';
// CI/CD build trigger v1

import { useState, useEffect } from 'react';
import { AsciiLogo, AsciiSection, AsciiProjectCard, AsciiBlogCard, AsciiLoader } from "@/components/ascii";
import Link from "next/link";
import { postsApi, nowApi, projectsApi, BlogPost, NowUpdate, Project } from "@/lib/api";

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

  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <div className="flex justify-center mb-6 overflow-x-auto">
          <AsciiLogo />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Welcome to my corner of the internet.
        </p>
      </section>

      <section className="border border-border p-6 bg-card card-hover">
        <h3 className="text-foreground mb-2 flex items-center gap-2">
          <span className="text-[var(--gradient-mid)]">&gt;</span> About
        </h3>
        <div className="text-muted-foreground">
          <p>When I'm not at a keyboard, I'm building one. Or a PC. Or printing something that didn't need to exist. Lego, anime, Pokémon cards, and zero self-control round out the chaos.</p>
        </div>
        <div className="mt-4 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline">
            Learn more about me -&gt;
          </Link>
        </div>
      </section>

      {projects.length > 0 && (
        <AsciiSection title="Featured Projects">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
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
          <div className="mt-4 text-right">
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-300 hover-underline">
              View all projects -&gt;
            </Link>
          </div>
        </AsciiSection>
      )}

      <AsciiSection title="Recent Posts">
        {isLoading ? (
          <AsciiLoader text="Loading posts" />
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
          Questions? Random thoughts? Just saying hi?
        </p>
        <Link
          href="/contact"
          className="btn-modern inline-block px-6 py-2 text-foreground no-underline"
        >
          [Send me a message]
        </Link>
      </section>
    </div>
  );
}
