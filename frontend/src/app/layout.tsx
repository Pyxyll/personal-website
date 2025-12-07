import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AsciiNav, AsciiFooter } from "@/components/ascii";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dylancollins.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dylan Collins | Software Developer",
    template: "%s | Dylan Collins",
  },
  description: "Software developer passionate about clean code, full-stack development, and open source. Building modern web applications with React, Next.js, and Laravel.",
  keywords: ["software developer", "full-stack developer", "web development", "React", "Next.js", "Laravel", "TypeScript", "open source", "portfolio"],
  authors: [{ name: "Dylan Collins", url: siteUrl }],
  creator: "Dylan Collins",
  publisher: "Dylan Collins",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Dylan Collins",
    title: "Dylan Collins | Software Developer",
    description: "Software developer passionate about clean code, full-stack development, and open source. Building modern web applications with React, Next.js, and Laravel.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Dylan Collins - Software Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dylan Collins | Software Developer",
    description: "Software developer passionate about clean code, full-stack development, and open source.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@dylancollins",
  },
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/rss.xml`,
    },
  },
  verification: {
    // Add these when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

// JSON-LD structured data for the site
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dylan Collins",
  url: "https://dylancollins.dev",
  jobTitle: "Software Developer",
  description: "Software developer passionate about clean code, full-stack development, and open source.",
  sameAs: [
    "https://github.com/dylancollins",
    "https://linkedin.com/in/dylancollins",
    "https://twitter.com/dylancollins",
  ],
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "Laravel",
    "Node.js",
    "Full-Stack Development",
    "Web Development",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${ibmPlexMono.variable} antialiased min-h-screen flex flex-col`}>
        <AsciiNav />
        <main className="flex-1 max-w-4xl mx-auto px-4 w-full">
          {children}
        </main>
        <AsciiFooter />
      </body>
    </html>
  );
}
