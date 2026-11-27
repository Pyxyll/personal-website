// Single source of truth for what I do.
//
// The skills page, the homepage plate, the nav menu and the Person JSON-LD
// all read from here, so a line of copy changes in exactly one place.
//
// The slugs are load-bearing: each one has a schematic drawn for it in
// components/SkillSketch.astro, animated in scripts/marks.ts and built as an
// object in scripts/marks3d.ts. Rename a slug and its drawing goes with it.

export interface Skill {
  /** Stable id. Keys the schematic, and is the anchor on /skills/. */
  slug: string;
  title: string;
  /** One line, sits under the title. */
  tagline: string;
  /** The claim, in two or three sentences. No more. */
  body: string;
  /** What that looks like in practice. Concrete, not adjectives. */
  practice: string[];
  /** What I reach for, listed on /skills/. Lead with the ones worth leading
      with. The homepage leaves them out: the work cards carry the stack. */
  tools: string[];
  /** Pages on this site that back the claim up. */
  proof?: { label: string; href: string }[];
}

export const skills: Skill[] = [
  {
    slug: "website",
    title: "Websites and front-end",
    tagline: "Interfaces that load fast and read clearly.",
    body:
      "I design and build front-ends by hand: semantic HTML, type and layout that hold up on a phone, and motion that earns its place. Static where it can be, so pages load instantly. The schematics on this site are the example closest to hand: three.js on a desktop, plain SVG everywhere else.",
    practice: [
      "Design and build, mobile first",
      "Accessibility as a starting point: measured contrast, keyboard paths, reduced motion honoured",
      "Component systems in React and Astro",
      "WebGL, three.js and GSAP where motion helps",
      "Search, structured data and social cards set up properly",
      "Content editing that someone who is not a developer can use",
    ],
    tools: ["Astro", "React", "TypeScript", "Tailwind", "three.js", "GSAP"],
    proof: [
      { label: "This site", href: "/work/dylancollins-me/" },
      { label: "Nerd-Up Collective concept", href: "/demos/nerd-up-collective/" },
      { label: "Waterford Comics concept", href: "/demos/waterford-comics/" },
    ],
  },
  {
    slug: "app",
    title: "Web apps and platforms",
    tagline: "Software with real users, roles and data behind it.",
    body:
      "At The B!G Idea I'm the lead developer on the platform schools across Ireland use: five kinds of user, each with their own dashboard and permissions, on Laravel, React and PostgreSQL. I wrote most of it, from the data model to the design system, and it went from first commit to live in schools in eight months, shipped in phases rather than one big reveal.",
    practice: [
      "Data modelling, and migrations off legacy systems",
      "Accounts, roles and permissions",
      "One design system shared across a whole product",
      "Real-time features over WebSockets",
      "Queues, scheduled jobs and transactional email",
      "Feature tests and CI on every pull request",
    ],
    tools: ["Laravel", "React", "PostgreSQL", "TypeScript", "Inertia", "Redis"],
    proof: [
      { label: "The B!G Idea platform", href: "/work/learning-platform/" },
    ],
  },
  {
    slug: "automation",
    title: "Automation and integrations",
    tagline: "Jobs that move data on their own, and say when they fail.",
    body:
      "I connect applications to the tools a team already uses, move data on a schedule, and put alerts where being wrong is expensive. On the platform that means its mail engine, the dry-run-first import from the old system, and the jobs that prune old data on time.",
    practice: [
      "Syncing an application with the tools a team already works in",
      "Scheduled jobs, imports and exports",
      "Email that batches itself instead of sending twenty at once",
      "Data migrations with a dry run first",
      "Error handling that tells a human when something breaks",
    ],
    tools: ["PHP", "TypeScript", "Bash", "Webhooks", "Queues and cron"],
  },
  {
    slug: "hosting",
    title: "Infrastructure and operations",
    tagline: "I run what I build.",
    body:
      "Linux servers, Docker, reverse proxies, certificates, backups, and deploys that are a push and not a ceremony. I look after production for a charity's platform and a server full of my own projects, and I would sooner keep one box I understand than rent five I do not.",
    practice: [
      "Linux administration, Apache and nginx",
      "Docker and Coolify, push to deploy",
      "CI/CD on GitHub Actions, with a reviewer gate on production",
      "Nightly backups, and restores that get tested",
      "Firewalls, TLS and locked-down internal services",
      "Monitoring with alerts that reach a person",
    ],
    tools: ["Linux", "Docker", "GitHub Actions", "nginx", "Apache", "Coolify", "Tailscale"],
    proof: [
      { label: "VPS", href: "/work/vps/" },
      { label: "Media server", href: "/work/media-server/" },
    ],
  },
  {
    slug: "ai",
    title: "Working with AI",
    tagline: "The agent types. I read every line.",
    body:
      "Most of what I ship now starts with a coding agent and ends with me reading every line of it. I give agents the project's conventions and its history, run several at once on reviews and large changes, and keep tests and my own review as the gate. I also build small tools on models directly, local ones included.",
    practice: [
      "Agentic coding on production work, every day",
      "Written guidelines and project memory, so an agent starts with context",
      "Parallel agents in separate worktrees for reviews, audits and large changes",
      "Local models through Ollama when the data should not leave the machine",
      "Connecting agents to the tools a team already uses",
      "A human check on anything costly to get wrong",
    ],
    tools: ["Claude Code", "Ollama", "MCP", "Local vision models"],
    proof: [{ label: "Shot In The Dark", href: "/work/shot-in-the-dark/" }],
  },
];

/**
 * How a piece of work goes when an agent is doing some of the typing. Shown
 * on the homepage and under the AI entry on /skills/. A real sequence: these
 * happen in this order, which is why they are drawn joined up.
 */
export const aiLoop = [
  {
    title: "Brief it properly",
    body:
      "An agent is only as good as what it is told. I keep a project's conventions, decisions and history written down where it can read them, so it starts from context and not from zero.",
  },
  {
    title: "Split the work",
    body:
      "Reviews, audits and migrations divide well. Each part goes to its own agent in its own worktree, and a second pass checks the first before any of it reaches me.",
  },
  {
    title: "Read every line",
    body:
      "Nothing merges because a model said so. Tests, type checks and my own review are the gate, and the decisions that are expensive to get wrong stay with a person.",
  },
];

/** The other half: a model as the feature, not the typist. Not a step in the
    loop above, so it sits beside it rather than at the end of it. */
export const aiBuild = {
  title: "Building with models",
  body:
    "Where a model is the feature and not the typist, I keep it small and local where I can: one narrow job, on hardware I control.",
  proof: { label: "Shot In The Dark", href: "/work/shot-in-the-dark/" },
};
