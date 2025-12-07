import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Dylan Collins - a software developer passionate about clean code, full-stack development, and building elegant solutions. Skills include React, Next.js, Laravel, TypeScript, and more.",
  openGraph: {
    title: "About Dylan Collins",
    description: "Learn more about Dylan Collins - a software developer passionate about clean code, full-stack development, and building elegant solutions.",
    type: "profile",
    url: "/about",
  },
  twitter: {
    card: "summary",
    title: "About Dylan Collins",
    description: "Learn more about Dylan Collins - a software developer passionate about clean code and elegant solutions.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
