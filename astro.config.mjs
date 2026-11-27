import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dylancollins.me",
  output: "static",
  trailingSlash: "always",
  // The freelance pages are gone. Anyone arriving on an old link lands on the
  // page that replaced it instead of a 404.
  redirects: {
    "/services": "/skills/",
    "/start": "/contact/",
    // Retired demos. Old links land on the work index, not a 404.
    "/work/pagerr": "/work/",
    "/work/pagerr/demo": "/work/",
    "/work/shiftdesk": "/work/",
    "/work/shiftdesk/demo": "/work/",
    // Writing is gone for now. Its one post's link lands on the homepage.
    "/writing": "/",
    "/writing/moving-clients-off-wordpress": "/",
  },
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
      // /demos/ holds noindexed spec concepts pitched to prospects — listing
      // them here would contradict their robots tag and put them in front of
      // the businesses they're about.
      filter: (page) =>
        !page.includes("/og/") && !page.includes("/og.png") && !page.includes("/demos/"),
      serialize: (item) => {
        // Bump home + the pages a hiring manager reads; lower /contact, /now, /privacy.
        if (item.url === "https://dylancollins.me/") item.priority = 1.0;
        else if (item.url.endsWith("/cv/") || item.url.endsWith("/skills/")) item.priority = 0.9;
        else if (item.url.endsWith("/work/")) item.priority = 0.9;
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
