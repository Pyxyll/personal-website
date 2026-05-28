// Single source of truth for site-wide values used in metadata, structured
// data, OG images, manifest, RSS, etc. Edit here, not scattered across pages.

export const site = {
  name: "Dylan Collins",
  shortName: "Dylan Collins",
  title: "Dylan Collins — Software engineer",
  description:
    "Software engineer in Ireland. Freelance briefs, end-to-end web apps, and writing about the craft.",
  url: "https://dylancollins.me",
  locale: "en_IE",
  language: "en-IE",
  themeColor: "#0a0a0a",
  accent: "#da2862",
  author: {
    name: "Dylan Collins",
    email: "hello@dylancollins.me",
    role: "Software engineer",
    country: "Ireland",
    countryCode: "IE",
  },
  social: {
    github: "https://github.com/pyxyll",
    linkedin: "https://www.linkedin.com/in/dylan-c-collins/",
    // Add your X / Mastodon / Bluesky handles when you have them
    twitterHandle: "", // e.g. "@dylan"
    mastodon: "",
    bluesky: "",
  },
  // sameAs links go into the Person JSON-LD on the homepage. Add any profile
  // URL that proves identity (GitHub, LinkedIn, dev.to, Mastodon, etc.).
  sameAs: [
    "https://github.com/pyxyll",
    "https://www.linkedin.com/in/dylan-c-collins/",
    "https://pyxyll.com",
  ],
} as const;

export type Site = typeof site;
