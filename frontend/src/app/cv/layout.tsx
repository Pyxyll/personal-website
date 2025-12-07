import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV / Resume",
  description: "Dylan Collins's professional resume and CV. Senior Software Developer with 4+ years of experience in full-stack development, React, Next.js, Node.js, and Laravel.",
  openGraph: {
    title: "CV / Resume - Dylan Collins",
    description: "Senior Software Developer with 4+ years of experience in full-stack development. View my professional experience, skills, and certifications.",
    type: "profile",
    url: "/cv",
  },
  twitter: {
    card: "summary",
    title: "CV / Resume - Dylan Collins",
    description: "Senior Software Developer with 4+ years of experience in full-stack development.",
  },
  alternates: {
    canonical: "/cv",
  },
};

export default function CVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
