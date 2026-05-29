import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dylancollins.me",
  output: "static",
  trailingSlash: "always",
  prefetch: {
    // Hover-prefetch internal links; subsequent navs feel instant without
    // the bandwidth cost of prefetching everything.
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  build: {
    inlineStylesheets: "auto",
  },
  integrations: [
    mdx(),
    react(),
    sitemap({
      changefreq: "monthly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/og/") && !page.includes("/og.png"),
      serialize: (item) => {
        // Bump home + writing list priority; lower /contact + /now slightly
        if (item.url === "https://dylancollins.me/") item.priority = 1.0;
        else if (item.url.endsWith("/writing/") || item.url.endsWith("/work/")) item.priority = 0.9;
        else if (item.url.includes("/writing/")) item.priority = 0.8;
        else if (item.url.includes("/work/")) item.priority = 0.8;
        else item.priority = 0.6;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwind()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },
});
