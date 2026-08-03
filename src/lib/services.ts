// Single source of truth for the services sold under dylancollins.me.
//
// The services page, the homepage teaser, the project-brief form's service
// picker and the JSON-LD offer catalog all read from here, so a price or a
// line of copy changes in exactly one place.
//
// ── PRICES ARE PLACEHOLDERS ──────────────────────────────────────────────
// The `from` figures below are indicative starting points, not researched
// quotes. Set them to your own numbers before this goes live: they are the
// first thing a prospect anchors on, and the main filter on who bothers
// enquiring. `from` is a whole euro amount, `fromUnit` is appended after it
// (e.g. "/month") for anything recurring.

export interface Service {
  /** Stable id. Used as the brief form's value and in /start/?service=… links. */
  slug: string;
  /** Marginalia number, matching the site's 00x convention. */
  num: string;
  title: string;
  /** One line, sits under the title on the services page. */
  tagline: string;
  /** The pitch. Two or three sentences, no more. */
  body: string;
  /** What the client actually receives. Concrete, not adjectives. */
  deliverables: string[];
  /** Indicative starting price, whole euro. */
  from: number;
  /** Appended to the price for recurring work, e.g. "/month". */
  fromUnit?: string;
  /** What that starting figure buys, so the number has a shape. */
  fromNote: string;
  timeline: string;
  /** Existing pages on this site that evidence the claim. */
  proof?: { label: string; href: string }[];
}

export const services: Service[] = [
  {
    slug: "website",
    num: "001",
    title: "Websites and landing pages",
    tagline: "A site that reads like the business behind it.",
    body:
      "Most small business sites are a template with the logo swapped in. I build the other kind: hand-made, fast, and shaped around the one thing you need a visitor to do. Static by default, so it loads instantly and costs almost nothing to run.",
    deliverables: [
      "Design and build, mobile first",
      "Page structure and copy direction",
      "Enquiry forms that land in your inbox",
      "Search, sitemap and structured data set up properly",
      "Analytics, if you want it",
      "Handover so you can edit your own content",
    ],
    from: 1200,
    fromNote: "A brochure site of roughly three to six pages.",
    timeline: "2 to 4 weeks",
    proof: [
      { label: "Nerd-Up Collective concept", href: "/demos/nerd-up-collective/" },
      { label: "Waterford Comics concept", href: "/demos/waterford-comics/" },
    ],
  },
  {
    slug: "app",
    num: "002",
    title: "Custom web apps and internal tools",
    tagline: "The tool your business already runs on, minus the spreadsheet.",
    body:
      "Rotas, bookings, stock, approvals: whatever the shared spreadsheet has quietly grown into. I build software that fits how you already work, instead of asking you to bend around something off the shelf. Scoped in phases, so there is something usable early rather than a big reveal at the end.",
    deliverables: [
      "Discovery, and a written scope before any code",
      "A clickable prototype you can react to",
      "Build in phases, usable at each one",
      "Accounts, roles and permissions",
      "Data brought across from what you use now",
      "Deployment, backups and documentation",
    ],
    from: 4500,
    fromNote: "Phase one: a first version real people can use.",
    timeline: "6 weeks and up",
    proof: [
      { label: "ShiftDesk", href: "/work/shiftdesk/" },
      { label: "Pagerr", href: "/work/pagerr/" },
    ],
  },
  {
    slug: "automation",
    num: "003",
    title: "Automation and integrations",
    tagline: "Stop retyping the same data into two systems.",
    body:
      "If someone in your business loses a morning a week moving data between tools, that is a script, not a job. I connect the systems you already pay for, move the data automatically, and put alerts on the parts where being wrong is expensive.",
    deliverables: [
      "A short audit of the manual steps and what they cost you",
      "Integrations between the tools you already use",
      "Scheduled jobs, imports and exports",
      "Reporting that arrives without anyone building it",
      "Error handling that tells a human when something breaks",
    ],
    from: 800,
    fromNote: "One automation, scoped and delivered end to end.",
    timeline: "1 to 2 weeks",
  },
  {
    slug: "hosting",
    num: "004",
    title: "Hosting, infrastructure and care",
    tagline: "Someone whose job it is when the site goes down.",
    body:
      "Hosting, updates, backups, certificates, and the security patches nobody thinks about until the morning they matter. I run the infrastructure so what I built for you stays up, and I am the person you ring when it does not.",
    deliverables: [
      "Managed hosting and deployments",
      "Daily backups, and restores that get tested",
      "Updates and security patches",
      "Uptime monitoring with alerts to me, not to you",
      "A small pool of changes each month",
      "Priority response when something is wrong",
    ],
    from: 95,
    fromUnit: "/month",
    fromNote: "Care plan. Monthly, cancel whenever.",
    timeline: "Ongoing",
    proof: [{ label: "Self-hosted media server", href: "/work/media-server/" }],
  },
];

/** How an engagement actually runs, start to finish. Shown on /services/. */
export const process = [
  {
    step: "01",
    title: "You send a brief",
    body:
      "A few lines about what you need and roughly what you can spend. No charge, no obligation, and no sales sequence afterwards.",
  },
  {
    step: "02",
    title: "We talk it through",
    body:
      "Half an hour on a call or over email, to work out what the real problem is and whether I am the right person for it. Sometimes the answer is no, and I will say so.",
  },
  {
    step: "03",
    title: "You get a fixed quote",
    body:
      "A written scope with a fixed price against it. You know what it costs before anything starts, and I carry the risk if I estimated badly.",
  },
  {
    step: "04",
    title: "I build it in the open",
    body:
      "Regular check-ins and something you can click through early, so course corrections happen while they are still cheap.",
  },
  {
    step: "05",
    title: "Handover, then support if you want it",
    body:
      "Code, access and documentation are yours. A care plan is available if you would rather not think about hosting again.",
  },
];

/** Answers to what people actually ask before they enquire. */
export const faqs = [
  {
    q: "Who do you work with?",
    a: "Small businesses, sole traders and small teams, mostly in Ireland and mostly remote. I am happy to meet in person in the south east.",
  },
  {
    q: "Do you take on small jobs?",
    a: "Yes. A one-page site or a single automation is a perfectly good piece of work, and often the best way to find out whether we work well together.",
  },
  {
    q: "How do you charge?",
    a: "Fixed price against a written scope for project work, and a flat monthly fee for care plans. Where a project genuinely cannot be scoped up front, I will say so and we agree a day rate instead.",
  },
  {
    q: "What if I already have a site?",
    a: "Then the question is whether it is worth improving or worth replacing, and it is not always the second one. Send me the URL and I will tell you honestly.",
  },
  {
    q: "Are you available right now?",
    a: "I take on a small number of projects alongside a full-time role, so lead times are real. Send a brief and I will tell you straight away when I could start.",
  },
];

/** Budget bands offered on the brief form. Values are stored verbatim in the email. */
export const budgetBands = [
  "Under €1,000",
  "€1,000 to €3,000",
  "€3,000 to €7,500",
  "€7,500 to €15,000",
  "€15,000 and up",
  "Not sure yet",
];

/** Timeline options offered on the brief form. */
export const timelines = [
  "As soon as possible",
  "Within a month",
  "One to three months",
  "Later this year",
  "Just exploring for now",
];

export const priceFormat = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
