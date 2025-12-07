import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now",
  description: "What Dylan Collins is currently working on, learning, and focused on. A /now page inspired by Derek Sivers - a snapshot of current priorities and projects.",
  openGraph: {
    title: "What I'm Doing Now - Dylan Collins",
    description: "What I'm currently working on, learning, and focused on. A snapshot of my current priorities and projects.",
    type: "website",
    url: "/now",
  },
  twitter: {
    card: "summary",
    title: "What I'm Doing Now - Dylan Collins",
    description: "What I'm currently working on, learning, and focused on. A snapshot of my current priorities.",
  },
  alternates: {
    canonical: "/now",
  },
};

export default function NowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
