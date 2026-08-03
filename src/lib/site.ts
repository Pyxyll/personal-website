// Single source of truth for site-wide values used in metadata, structured
// data, OG images, manifest, RSS, etc. Edit here, not scattered across pages.

export const site = {
  name: "Dylan Collins",
  shortName: "Dylan Collins",
  title: "Dylan Collins · Software engineer",
  description:
    "Software engineer in Ireland. I build for work, for fun, and for people who need a hand.",
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
    email: "hello@dylancollins.me",
    role: "Software engineer",
    country: "Ireland",
    countryCode: "IE",
  },
  // The trading side of the site: services, pricing, the project brief form.
  // Sole trader, so the legal name and the trading name are the same person.
  business: {
    legalName: "Dylan Collins",
    tradingName: "dylancollins.me",
    structure: "Sole trader registered in Ireland",
    currency: "EUR",
    // Flip to true once you cross the VAT registration threshold, and the
    // pricing note on /services/ changes with it.
    vatRegistered: false,
    // Where you'll actually take work. Feeds the JSON-LD areaServed.
    serviceArea: ["Ireland", "Remote worldwide"],
    // Shown on /services/ so a prospect knows the lead time is real.
    availability: "Taking a small number of projects",
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
