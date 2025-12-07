import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore Dylan Collins's open source projects and side projects. Full-stack web applications, CLI tools, developer utilities, and more built with React, Next.js, Rust, Go, and Python.",
  openGraph: {
    title: "Projects - Dylan Collins",
    description: "Explore my open source projects and side projects. Full-stack web applications, CLI tools, developer utilities, and more.",
    type: "website",
    url: "/projects",
  },
  twitter: {
    card: "summary",
    title: "Projects - Dylan Collins",
    description: "Explore my open source projects and side projects. Full-stack web applications, CLI tools, and developer utilities.",
  },
  alternates: {
    canonical: "/projects",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
