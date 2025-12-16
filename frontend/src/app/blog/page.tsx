'use client';

import { useState, useEffect } from 'react';
import { AsciiSection, AsciiBlogCard, AsciiDivider, AsciiLoader } from "@/components/ascii";
import { Badge } from "@/components/ui/badge";
import { postsApi, BlogPost } from "@/lib/api";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postsApi.getAll();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const allTags = [...new Set(posts.flatMap((post) => post.tags || []))].sort();

  const filteredPosts = posts.filter((post) => {
    const tagMatch = !selectedTag || (post.tags || []).includes(selectedTag);
    const searchMatch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return tagMatch && searchMatch;
  });

  const featuredPosts = posts.filter((p) => p.featured);

  return (
    <div className="space-y-8">
      <section className="border border-border p-4 bg-card">
        <h1 className="text-foreground text-xl mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Writing about software development, tools, and things I learn along the way.
          Mostly technical content with occasional opinions.
        </p>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="border border-border bg-card p-2 flex items-center">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 outline-none text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>
        </div>

        {!isLoading && allTags.length > 0 && (
          <div className="mb-6">
            <span className="text-muted-foreground text-sm mr-2">tags:</span>
            <div className="inline-flex flex-wrap gap-1 mt-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-1 text-xs transition-colors ${
                  !selectedTag
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                [all]
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-2 py-1 text-xs transition-colors ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {isLoading ? (
        <AsciiLoader text="Loading posts" />
      ) : (
        <>
          {featuredPosts.length > 0 && (
            <>
              <AsciiSection title="Featured Posts">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featuredPosts.map((post) => (
                    <AsciiBlogCard
                      key={post.slug}
                      title={post.title}
                      description={post.description}
                      date={post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : ''}
                      tags={post.tags || []}
                      readTime={post.read_time || undefined}
                      href={`/blog/${post.slug}`}
                      image={post.featured_image}
                      imageAlt={post.featured_image_alt}
                    />
                  ))}
                </div>
              </AsciiSection>

              <AsciiDivider />
            </>
          )}

          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredPosts.length} of {posts.length} posts
            {selectedTag && (
              <span>
                {" "}
                tagged with <Badge variant="outline" className="text-xs">#{selectedTag}</Badge>
              </span>
            )}
          </div>

          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <AsciiBlogCard
                  key={post.slug}
                  title={post.title}
                  description={post.description}
                  date={post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : ''}
                  tags={post.tags || []}
                  readTime={post.read_time || undefined}
                  href={`/blog/${post.slug}`}
                  image={post.featured_image}
                  imageAlt={post.featured_image_alt}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border p-8 text-center text-muted-foreground">
              {posts.length === 0 ? 'No posts yet.' : 'No posts found matching your search.'}
            </div>
          )}
        </>
      )}

      <section className="border border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Subscribe to RSS feed for updates
          </span>
          <a
            href="/rss.xml"
            className="text-foreground text-sm hover:underline"
          >
            [RSS]
          </a>
        </div>
      </section>
    </div>
  );
}
