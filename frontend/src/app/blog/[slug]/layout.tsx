import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/server-api";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dylancollins.me";
  const postUrl = `${siteUrl}/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: "Dylan Collins" }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: postUrl,
      publishedTime: post.published_at || undefined,
      authors: ["Dylan Collins"],
      tags: post.tags,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${siteUrl}/og-image.png`],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostLayout({ params, children }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dylancollins.me";

  // JSON-LD for blog post (Article schema)
  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.description,
        author: {
          "@type": "Person",
          name: "Dylan Collins",
          url: siteUrl,
        },
        publisher: {
          "@type": "Person",
          name: "Dylan Collins",
        },
        datePublished: post.published_at,
        url: `${siteUrl}/blog/${slug}`,
        keywords: post.tags?.join(", "),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${siteUrl}/blog/${slug}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
