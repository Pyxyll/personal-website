import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Technical articles and insights from Dylan Collins on software development, web technologies, React, Next.js, Laravel, and developer tools. Practical tutorials and opinions.",
  openGraph: {
    title: "Blog - Dylan Collins",
    description: "Technical articles and insights on software development, web technologies, and developer tools. Practical tutorials and opinions.",
    type: "website",
    url: "/blog",
  },
  twitter: {
    card: "summary",
    title: "Blog - Dylan Collins",
    description: "Technical articles and insights on software development, web technologies, and developer tools.",
  },
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
