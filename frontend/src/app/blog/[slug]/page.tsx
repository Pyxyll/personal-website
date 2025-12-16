'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AsciiDivider, AsciiPageLoader } from "@/components/ascii";
import { Badge } from "@/components/ui/badge";
import { postsApi, BlogPost } from "@/lib/api";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      const data = await postsApi.getBySlug(slug);
      setPost(data);
    } catch (err) {
      console.error('Failed to load post:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AsciiPageLoader text="Loading post" />;
  }

  if (error || !post) {
    return (
      <div className="space-y-8">
        <section className="border border-border p-6 bg-card text-center">
          <h1 className="text-foreground text-xl mb-4">404: Post Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested post could not be found.
          </p>
          <Link href="/blog" className="text-foreground hover:underline">
            [Back to Blog]
          </Link>
        </section>
      </div>
    );
  }

  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl text-foreground font-bold mt-8 mb-4 first:mt-0">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg text-foreground font-bold mt-6 mb-3">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      if (paragraph.startsWith('```')) {
        const lines = paragraph.split('\n');
        const code = lines.slice(1, -1).join('\n');
        return (
          <pre key={index} className="bg-secondary p-4 overflow-x-auto my-4 border border-border">
            <code className="text-sm">{code}</code>
          </pre>
        );
      }
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={index} className="space-y-1 my-4">
            {items.map((item, i) => (
              <li key={i} className="text-muted-foreground flex gap-2">
                <span className="text-foreground">-</span>
                <span>{item.replace('- ', '')}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (paragraph.match(/^\d\./)) {
        const items = paragraph.split('\n').filter(line => line.match(/^\d\./));
        return (
          <ol key={index} className="space-y-1 my-4">
            {items.map((item, i) => (
              <li key={i} className="text-muted-foreground flex gap-2">
                <span className="text-foreground">{i + 1}.</span>
                <span>{item.replace(/^\d+\.\s*\*\*([^*]+)\*\*\s*-\s*/, '$1 - ')}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <p key={index} className="text-muted-foreground my-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <article className="space-y-8">
      <header className="border border-border p-6 bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/blog" className="hover:text-foreground">blog</Link>
          <span>/</span>
          <span className="text-foreground">{slug}</span>
        </div>

        <h1 className="text-2xl text-foreground font-bold mb-2">{post.title}</h1>
        <p className="text-muted-foreground mb-4">{post.description}</p>

        {post.featured_image && (
          <div className="mb-4 overflow-hidden border border-border">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full max-h-64 object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {post.published_at && (
            <span className="text-muted-foreground">
              [{new Date(post.published_at).toISOString().split('T')[0]}]
            </span>
          )}
          {post.read_time && (
            <span className="text-muted-foreground">~ {post.read_time} read</span>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      <AsciiDivider />

      <div className="prose prose-invert max-w-none">
        <div className="border border-border p-6 bg-card">
          {renderContent(post.content)}
        </div>
      </div>

      <AsciiDivider />

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border border-border p-4 bg-card">
        <Link href="/blog" className="text-foreground hover:underline">
          [Back to Blog]
        </Link>
        <div className="text-sm text-muted-foreground">
          Share:{" "}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://dylancollins.me/blog/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            Twitter
          </a>
        </div>
      </footer>
    </article>
  );
}
