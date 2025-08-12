import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dylan Collins - Soon",
  description: "Something cool is on the way. A developer's journey continues...",
  keywords: "developer, coming soon, portfolio, web development",
  authors: [{ name: "Dylan Collins" }],
  openGraph: {
    title: "Dylan Collins - Soon",
    description: "Something cool is on the way",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
