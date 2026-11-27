// Single source of truth for the CV.
//
// /cv/ renders from this, the homepage's experience strip reads the first few
// roles from it, and `npm run cv:pdf` prints /cv/ to public/dylan-collins-cv.pdf.
// So the web CV and the PDF cannot drift apart: edit here, run the script,
// commit both.
//
// Keep it to what belongs on a public page. No phone number, no home address.

export interface Role {
  title: string;
  org: string;
  orgUrl?: string;
  location: string;
  /** Free text, as it should read: "Jul 2024". */
  start: string;
  /** "Present" for the current role. */
  end: string;
  /** One line on what the job was. Optional: older roles can go without. */
  summary?: string;
  /** What I did there. Lead with outcomes, three to seven lines. */
  points: string[];
  stack: string[];
}

export interface Award {
  name: string;
  /** The event or body that gave it. */
  event: string;
  year: string;
  /** What it was for and where I come into it, as it should read. Keep it
   *  exact: the award went to the organisation's platform, not to me. */
  detail: string;
  /** Where to read more, usually the matching case study. */
  href?: string;
}

export interface Study {
  award: string;
  school: string;
  start: string;
  end: string;
  detail?: string;
}

export const cv = {
  /** Shown under "Last updated" on /cv/. Bump it when the content changes. */
  updated: "2026-11-25",

  /** Where the generated PDF lives, relative to the site root. */
  pdf: "/dylan-collins-cv.pdf",

  /** Two short paragraphs. The first is the one a recruiter reads. */
  summary: [
    "Full-stack developer with more than ten years of building websites and running the systems under them. Most recently I rebuilt a charity's learning platform from scratch in Laravel, React and PostgreSQL, wrote most of it myself, and took it to production.",
    "I work with AI coding agents every day and treat them as a tool with limits: briefed properly, run in parallel, and checked line by line. First class honours in Multimedia Applications Development from SETU Waterford, on top of the years of doing it for a living.",
  ],

  experience: [
    {
      title: "Software Developer",
      org: "The B!G Idea",
      orgUrl: "https://thebigidea.ie",
      location: "Ireland",
      start: "Jun 2024",
      end: "Present",
      summary:
        "An education programme run in secondary schools across Ireland. I look after the platform that students, teachers and industry mentors use to take part.",
      points: [
        "Rebuilt the learning platform from scratch as one Laravel and React application serving five kinds of user: students, teachers, mentors, partner companies and staff. Wrote most of the codebase myself.",
        "Designed student access around team links in place of individual accounts, so the platform holds far less personal data about under-18s.",
        "Built one design system that themes itself per role, so every screen in the product comes from the same component library.",
        "Built the mail engine behind the programme's email: typed triggers, batching, date-anchored and scheduled sends, and an admin view of what fires when.",
        "Set up deployment, CI, staging, nightly backups and a locked-down document conversion service on Linux.",
        "Took the platform through an independent data protection and safeguarding readiness review.",
        "Kept the legacy WordPress platform running throughout, security incident response included, then migrated its accounts across.",
        "Scoped and coordinated work for an external contract developer against a shared backlog.",
      ],
      stack: ["Laravel", "PHP", "React", "TypeScript", "Inertia", "PostgreSQL", "Redis", "Tailwind", "WordPress"],
    },
    {
      title: "College At Home Advisor",
      org: "Apple",
      location: "Remote",
      start: "Jul 2023",
      end: "Oct 2023",
      points: [
        "Remote technical support for iOS devices.",
        "Scored above 90% across the regular training assessments.",
      ],
      stack: ["Technical support", "iOS"],
    },
    {
      title: "Freelance Web Developer and Sysadmin",
      org: "Self-employed",
      location: "Remote",
      start: "Sep 2014",
      end: "Jul 2023",
      points: [
        "Built and deployed websites for a range of clients, from the first conversation to launch.",
        "Managed the servers, networks and configuration those sites ran on.",
        "Looked after performance and security once they were live.",
        "Handled the client communication and the project management myself.",
      ],
      stack: ["Node.js", "PHP", "Docker", "AWS", "Linux", "Bash"],
    },
    {
      title: "Web Services Admin and IT Support",
      org: "Panoptic IT Solutions",
      location: "Ireland",
      start: "Jun 2018",
      end: "Sep 2020",
      points: [
        "Worked with clients to pin down what their web projects needed.",
        "Wrote the design documents and delivered the projects with the design and development team.",
        "Troubleshooting and technical support.",
      ],
      stack: ["Web development", "Documentation", "IT support"],
    },
  ] as Role[],

  /** Newest first. The hero shows the first one. */
  awards: [
    {
      name: "Tech for Good Service Award",
      event: "Technology Ireland Industry Awards",
      year: "2026",
      detail:
        "Won by The B!G Idea's education platform. I'm the lead developer on its new version.",
      href: "/work/learning-platform/",
    },
  ] as Award[],

  education: [
    {
      award: "BSc in Multimedia Applications Development",
      school: "South East Technological University, Waterford",
      start: "2022",
      end: "2025",
      detail:
        "First class honours (1.1). Strongest modules: JavaScript (100%), Front-end Web Development (98%), UX Design (96%), Web Application Development (90%), System Administration (80%).",
    },
  ] as Study[],

  /** Grouped, most-used first within each group. */
  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "PHP", "SQL", "Rust", "Bash", "HTML", "CSS"] },
    { group: "Front-end", items: ["React", "Astro", "Inertia", "Next.js", "Svelte", "Tailwind CSS", "three.js", "GSAP"] },
    { group: "Back-end", items: ["Laravel", "Node.js", "WordPress", "PostgreSQL", "MySQL", "Redis", "GraphQL"] },
    { group: "Infrastructure", items: ["Linux", "Docker", "nginx", "Apache", "GitHub Actions", "Coolify", "AWS EC2", "Cloudflare Workers"] },
    { group: "AI", items: ["Claude Code", "Agentic workflows", "Ollama and local models", "MCP"] },
  ],
};

export type Cv = typeof cv;
