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
  /** Shown as "Updated" on /cv/. Bump it when the content changes. */
  updated: "2026-11-27",

  /** Where the generated PDF lives, relative to the site root. */
  pdf: "/dylan-collins-cv.pdf",

  /** A few short paragraphs. The first is the one a recruiter reads: the
      work. The second is the person, in my own words from my designed CV.
      The third is how I work and where I trained. */
  summary: [
    "Full-stack developer with more than ten years of building for the web and running the systems underneath, working mainly in Laravel, React, TypeScript and PostgreSQL. I'm the lead developer on The B!G Idea's education platform, which went live in schools across Ireland in August 2026 and won the Tech for Good Service Award that November.",
    "I'm driven by a passion for picking up new disciplines and mastering them. I have a keen eye for detail and love an interesting challenge; I'm a self-starter who thrives on personal and professional growth, and an effective collaborator with strong communication skills and a friendly, down-to-earth manner.",
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
        "An all-Ireland education charity whose programme runs in secondary schools. I'm the lead developer on the platform that students, teachers and industry mentors use to take part.",
      points: [
        "Lead developer on the platform's new version: one Laravel, React and TypeScript application (Inertia, PostgreSQL, Redis) for five kinds of user, from students and teachers to partner companies and staff, live in schools in August 2026, eight months after the first commit. Wrote most of the codebase and own its data model, architecture and deployment.",
        "Designed for under-18s from the start: students use team links instead of accounts, so the platform holds far less personal data about them, and I took it through an independent data protection (GDPR) and safeguarding readiness review.",
        "Built a role-themed design system and component library in React and Tailwind, so every screen in the product comes from shared components.",
        "Built the email engine (typed triggers, batching, date-anchored and scheduled sends on Redis queues) and the real-time features over WebSockets with Laravel Reverb: presence, team chat and live presentation sync.",
        "Set up the CI/CD pipeline: about 1,200 automated tests against PostgreSQL on every pull request, approval-gated deploys, staging, nightly backups and a locked-down document conversion service on Linux.",
        "Kept the original WordPress platform running and improving while the new one was built: about 15% faster, with issue reports down by about 92%, for the smoothest programme cycle to date. Then migrated its accounts across.",
        "Led the response to a security incident on the original platform, restoring service and hardening it against future attacks.",
        "Scoped, reviewed and onboarded the work of contract developers and an outside design partner: a shared backlog, code review, and the conventions and technical documentation they worked from.",
      ],
      stack: ["Laravel", "PHP", "React", "TypeScript", "Inertia", "PostgreSQL", "Redis", "Tailwind", "WordPress"],
    },
    {
      title: "Freelance Web Developer and Sysadmin",
      org: "Self-employed",
      location: "Remote",
      start: "Sep 2014",
      end: "Jun 2024",
      summary: "Client work alongside study and my other roles.",
      points: [
        "Built custom internal web applications and client websites, from the first conversation to launch.",
        "Created command-line tooling to automate internal workflows.",
        "Migrated client infrastructure to AWS, and maintained the Linux and Windows servers it ran on.",
        "Handled the client communication and the project management myself.",
      ],
      stack: ["Node.js", "PHP", "Docker", "AWS", "Linux", "Bash"],
    },
    {
      title: "College At Home Advisor",
      org: "Apple",
      location: "Remote",
      start: "Jul 2023",
      end: "Oct 2023",
      points: [
        "Delivered remote technical support and troubleshooting for iOS customers: more than 1,000 cases resolved, with a 99% customer satisfaction rating.",
        "Scored above 90% across the regular training assessments.",
      ],
      stack: ["Technical support", "iOS"],
    },
    {
      title: "Web Services Admin and IT Support",
      org: "Panoptic IT Solutions",
      location: "Ireland",
      start: "Jun 2018",
      end: "Sep 2020",
      points: [
        "Owned web projects end to end: gathered client requirements, wrote proposals and quotes, and coordinated designers and developers through to delivery.",
        "Delivered about 35 websites (e-commerce, bookings and brochure sites) on time and within budget.",
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
        "First class honours (1.1). A computing degree combining software development with creative media and UX design. Strongest modules: JavaScript (100%), Front-end Web Development (98%), UX Design (96%), Web Application Development (90%), System Administration (80%).",
    },
  ] as Study[],

  /** Grouped, most-used first within each group. */
  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "PHP", "SQL", "Rust", "Bash", "Dart", "HTML", "CSS"] },
    { group: "Front-end", items: ["React", "Astro", "Inertia", "Next.js", "Svelte", "Tailwind CSS", "Bootstrap", "three.js", "GSAP"] },
    { group: "Mobile", items: ["React Native", "Flutter"] },
    { group: "Back-end", items: ["Laravel", "Node.js", "Express", "WordPress", "REST", "WebSockets", "GraphQL"] },
    { group: "Data", items: ["PostgreSQL", "MySQL", "Redis", "MongoDB"] },
    { group: "Infrastructure", items: ["Linux", "Docker", "Git", "GitHub Actions", "nginx", "Apache", "Coolify", "AWS EC2", "Cloudflare Workers"] },
    { group: "Practices", items: ["CI/CD", "Automated testing", "Code review", "Data modelling", "REST APIs", "Accessibility (WCAG)", "GDPR", "Security hardening", "Technical documentation"] },
    { group: "AI", items: ["Claude Code", "Agentic workflows", "Ollama and local models", "MCP"] },
  ],

  /** One line, as it would read on paper. */
  interests: "3D printing, PC building, walking, cooking, travel, and Japanese history.",
};

export type Cv = typeof cv;
