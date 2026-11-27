// Single source of truth for site-wide values used in metadata, structured
// data, OG images, manifest, RSS, etc. Edit here, not scattered across pages.

export const site = {
  name: "Dylan Collins",
  shortName: "Dylan Collins",
  title: "Dylan Collins · Full-stack developer",
  description:
    "Full-stack developer in Ireland. I build web platforms end to end, run the servers they live on, and work with AI tooling every day.",
  url: "https://dylancollins.me",
  locale: "en_IE",
  language: "en-IE",
  themeColor: "#0a0a0a",
  accent: "#da2862",
  // Cloudflare Worker that handles the contact form (calls Resend server-side).
  // Source + deploy steps in worker/.
  contactEndpoint: "https://dylancollins-contact.dylan-ad3.workers.dev",
  author: {
    name: "Dylan Collins",
    email: "dylan@dylancollins.me",
    role: "Full-stack developer",
    country: "Ireland",
    countryCode: "IE",
  },
  // The job-hunt switch. While `open` is false the site is a portfolio with a
  // CV on it, which is a normal thing for anyone to have. Flip it to true and
  // the hero, the CV, the contact page and the footer all say out loud that
  // you are looking. One line, so it can go on and off with a commit.
  hiring: {
    open: false as boolean,
    line: "Open to new roles",
    looking: "Full-stack and platform engineering, remote or in Ireland",
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
