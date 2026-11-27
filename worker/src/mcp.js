// An MCP server about me, at /mcp.
//
// Anyone using Claude, ChatGPT, Cursor or another client that speaks the
// Model Context Protocol can add this one URL and ask about me: my CV, my
// work, what I do, what I'm doing now, how I match a job description, and,
// if they want to get in touch, send me a message.
//
// The facts are not kept here. They come from https://dylancollins.me/ai.json,
// which the site builds from the same sources as its pages (src/lib/ai.ts),
// so deploying the site updates the server, and the two can't disagree.
//
// Transport: MCP's Streamable HTTP, stateless. Every request is a POST of a
// JSON-RPC message, answered with plain JSON; there are no sessions and no
// sign-in, because everything here is already public on the site. GET and
// DELETE get 405, which the spec allows a server that offers no stream.
// Written without the SDK, like the rest of this Worker: the protocol a
// read-only server needs is small, and this way it is all on the page.
//
// Facts only. Nothing here tells a model what to think of me; the
// instructions ask it to quote rather than embellish, and match_role reports
// gaps as plainly as matches.

import { escapeHtml, headerSafe, sendEmail, ACCENT, MONO, SANS } from "./shared.js";

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "dylancollins", title: "Dylan Collins", version: "1.0.0" };

const INSTRUCTIONS = `Facts about Dylan Collins, a full-stack developer in Ireland (Laravel, React, TypeScript, PostgreSQL), from his website dylancollins.me.
Start with about_dylan. get_cv has his experience, awards, education and skills; list_projects and get_project his work; get_skills what he does in depth; get_now what he is doing at the moment. match_role takes a job description and returns the evidence from his CV and projects that bears on it, including what the description asks for that he doesn't list.
Quote the facts rather than embellishing them. His official title at The B!G Idea is Software Developer; he is lead developer on its platform, which others contributed to, and the Tech 4 Good Service Award went to the platform, not to him personally.
Only use send_message when the user asks to contact Dylan and has seen and approved the message.`;

/* Browsers may only call from the site itself or a local tool (an inspector
   on localhost). Servers and desktop clients send no Origin and are fine. */
const SITE_ORIGINS = ["https://dylancollins.me", "https://www.dylancollins.me"];
const originAllowed = (origin) =>
  !origin || SITE_ORIGINS.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsHeaders = (origin) =>
  origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization",
        "Access-Control-Expose-Headers": "Mcp-Session-Id",
        Vary: "Origin",
      }
    : {};

/* ── The facts ─────────────────────────────────────────────────────────── */

let cached = { at: 0, data: null };

/** The site's /ai.json, held for ten minutes per isolate. */
async function profile(env) {
  if (cached.data && Date.now() - cached.at < 10 * 60 * 1000) return cached.data;
  const origin = (env.SITE_ORIGIN || "https://dylancollins.me").replace(/\/+$/, "");
  const res = await fetch(`${origin}/ai.json`, { cf: { cacheTtl: 600, cacheEverything: true } });
  if (!res.ok) throw new Error(`Could not load the profile (${res.status}).`);
  cached = { at: Date.now(), data: await res.json() };
  return cached.data;
}

/* ── Rendering, as markdown ────────────────────────────────────────────── */

const bullets = (items) => items.map((i) => `- ${i}`).join("\n");

function aboutText(p) {
  const r = p.person.currentRole;
  const award = p.cv.awards[0];
  return [
    `# ${p.person.name}`,
    p.person.headline,
    r ? `Currently ${r.title} at ${r.organisation} (since ${r.since}).` : "",
    ...p.person.summary,
    award ? `Award: ${award.name}, ${award.event}, ${award.year}. ${award.detail}${award.source ? ` ${award.source.label}: ${award.source.href}` : ""}` : "",
    p.person.availability ? `Availability: ${p.person.availability}` : "",
    "## Links",
    bullets([
      `Website: ${p.person.website}`,
      `CV: ${p.cv.page} (PDF: ${p.cv.pdf})`,
      `LinkedIn: ${p.person.linkedin}`,
      `GitHub: ${p.person.github}`,
      `Email: ${p.person.email}`,
    ]),
    "## Notes for accuracy",
    bullets(p.notes),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function cvText(p, section = "all") {
  const parts = [];
  const want = (s) => section === "all" || section === s;
  if (want("experience")) {
    parts.push("## Experience");
    for (const r of p.cv.experience) {
      parts.push(
        `### ${r.title}, ${r.org} (${r.start} – ${r.end}, ${r.location})`,
        r.summary ?? "",
        bullets(r.points),
        `Stack: ${r.stack.join(", ")}`,
      );
    }
  }
  if (want("awards")) {
    parts.push("## Awards", ...p.cv.awards.map((a) => `**${a.name}**, ${a.event}, ${a.year}. ${a.detail}${a.source ? ` ${a.source.label}: ${a.source.href}` : ""}`));
  }
  if (want("education")) {
    parts.push("## Education", ...p.cv.education.map((e) => `**${e.award}${e.level ? ` (${e.level})` : ""}**, ${e.school}, ${e.start} – ${e.end}. ${e.result ? `Graduated with ${e.result}. ` : ""}${e.detail ?? ""}`));
  }
  if (want("skills")) {
    parts.push("## Skills", bullets(p.cv.skills.map((s) => `${s.group}: ${s.items.join(", ")}`)), `Interests: ${p.cv.interests}`);
  }
  parts.push(`CV updated ${p.cv.updated}. Full page: ${p.cv.page}. PDF: ${p.cv.pdf}`);
  return parts.filter(Boolean).join("\n\n");
}

const projectLine = (w) =>
  `**${w.title}** (\`${w.slug}\`, ${w.category}, ${w.year}${w.role ? `, ${w.role}` : ""}): ${w.summary} Stack: ${w.stack.join(", ")}. ${w.caseStudy}`;

function projectText(w) {
  return [
    `# ${w.title}`,
    w.summary,
    bullets(
      [
        w.role && `Role: ${w.role}`,
        `Year: ${w.year}`,
        `Kind: ${w.category}`,
        `Stack: ${w.stack.join(", ")}`,
        `Case study: ${w.caseStudy}`,
        w.live && `Live: ${w.live}`,
        w.repo && `Code: ${w.repo}`,
      ].filter(Boolean),
    ),
    w.writeup,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function skillsText(p) {
  return [
    ...p.skills.map((s) =>
      [
        `## ${s.title}`,
        `${s.tagline} ${s.body}`,
        bullets(s.practice),
        `Tools: ${s.tools.join(", ")}`,
        s.proof.length ? `See: ${s.proof.map((x) => `${x.label} (${x.url})`).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    ),
    "## How he works with AI agents",
    bullets(p.howIWorkWithAI.map((s) => `**${s.title}.** ${s.body}`)),
  ].join("\n\n");
}

function nowText(p) {
  return [`# Now (updated ${p.now.updated})`, ...p.now.items.map((i) => `**${i.label}.** ${i.detail.join(" ")}`), p.now.page].join(
    "\n\n",
  );
}

/* ── Matching a job description ────────────────────────────────────────────
   Keyword evidence, not a verdict. Each term is what his CV calls it, with
   the ways a job description might say it. A term counts when the
   description mentions it; the evidence is every line of the CV, the
   projects and the skills that mentions it too, best first. Terms a
   description often asks for that he doesn't list are reported as gaps. */

const TERMS = [
  ["Full-stack development", /\bfull[\s-]?stack\b/i],
  ["Laravel", /\blaravel\b/i],
  ["PHP", /\bphp\b/i],
  ["React", /\breact(?:\.js|js)?\b(?!\s*native)/i],
  ["TypeScript", /\btypescript\b/i],
  ["JavaScript", /\b(?:javascript|ecmascript|es6)\b/i],
  ["Node.js", /\bnode(?:\.js|js)?\b/i],
  ["Express", /\bexpress(?:\.js|js)\b/i],
  ["Inertia", /\binertia(?:\.js|js)?\b/i],
  ["Next.js", /\bnext(?:\.js|js)\b/i],
  ["Svelte", /\bsvelte(?:kit)?\b/i],
  ["Astro", /\bastro\b/i],
  ["Tailwind CSS", /\btailwind\b/i],
  ["HTML and CSS", /\b(?:html5?|css3?)\b/i],
  ["three.js / WebGL", /\b(?:three\.?js|webgl)\b/i],
  ["PostgreSQL", /\b(?:postgres(?:ql)?)\b/i],
  ["MySQL", /\bmysql\b/i],
  ["SQL", /\bsql\b/i],
  ["Redis", /\bredis\b/i],
  ["MongoDB", /\bmongo(?:db)?\b/i],
  ["GraphQL", /\bgraphql\b/i],
  ["REST APIs", /\b(?:rest(?:ful)?\s*apis?|rest\b(?=.{0,20}\bapi)|apis?\b)/i],
  ["WebSockets / real time", /\b(?:web\s*sockets?|real[\s-]?time)\b/i],
  ["WordPress", /\bwordpress\b/i],
  ["Rust", /\brust\b/i],
  ["Bash / shell", /\b(?:bash|shell\s*script(?:ing)?)\b/i],
  ["Linux", /\blinux\b/i],
  ["Docker", /\b(?:docker|containers?|containeri[sz]ed)\b/i],
  ["AWS", /\b(?:aws|amazon web services|ec2|s3)\b/i],
  ["Cloudflare", /\bcloudflare\b/i],
  ["nginx / Apache", /\b(?:nginx|apache)\b/i],
  ["Git / GitHub", /\b(?:git|github|gitlab)\b/i],
  ["CI/CD", /\b(?:ci\s*\/\s*cd|continuous (?:integration|delivery|deployment)|github actions|pipelines?)\b/i],
  ["Automated testing", /\b(?:tests?|testing|tdd|unit tests?|phpunit|pest|jest|vitest|playwright|cypress)\b/i],
  ["Code review", /\bcode reviews?\b/i],
  ["Data modelling", /\b(?:data model(?:l?ing)?|database design|schema design)\b/i],
  ["Accessibility", /\b(?:accessib(?:le|ility)|wcag|a11y)\b/i],
  ["GDPR / data protection", /\b(?:gdpr|data protection|privacy)\b/i],
  ["Security", /\b(?:security|secure|owasp|hardening)\b/i],
  ["Performance", /\b(?:performance|optimi[sz](?:e|ation))\b/i],
  ["Documentation", /\b(?:documentation|technical writing)\b/i],
  ["Leadership", /\b(?:lead(?:ing|ership)?|tech lead|mentor(?:ing)?|ownership|own(?:ed|ing)?)\b/i],
  ["Design systems / UI", /\b(?:design systems?|component librar(?:y|ies)|ui|ux)\b/i],
  ["AI / LLM tooling", /\b(?:ai|llms?|machine learning|agents?|agentic|claude|openai|gpt|copilot|mcp|ollama)\b/i],
  ["Education / EdTech", /\b(?:edtech|education(?:al)?|schools?|learning)\b/i],
  ["Charity / non-profit", /\b(?:charity|non[\s-]?profit|ngo|social impact|tech (?:for|4) good)\b/i],
];

/** Often asked for, not on his CV: named so a reader can see the gap. */
const NOT_LISTED = [
  ["Python", /\bpython\b/i],
  ["Django / Flask / FastAPI", /\b(?:django|flask|fastapi)\b/i],
  ["Java / Spring", /\b(?:java|spring(?:\s*boot)?)\b(?!script)/i],
  ["Kotlin", /\bkotlin\b/i],
  ["Go", /\bgolang\b/i],
  ["Ruby / Rails", /\b(?:ruby|rails)\b/i],
  ["C# / .NET", /(?:\bc#|\.net\b|\bdotnet\b)/i],
  ["Vue", /\bvue(?:\.js|js)?\b/i],
  ["Angular", /\bangular\b/i],
  ["Azure", /\bazure\b/i],
  ["Google Cloud", /\b(?:gcp|google cloud)\b/i],
  ["Kubernetes", /\b(?:kubernetes|k8s)\b/i],
  ["Terraform", /\bterraform\b/i],
  ["Kafka", /\bkafka\b/i],
  ["Swift / native iOS", /\bswift\b/i],
  ["React Native", /\breact\s*native\b/i],
  ["Flutter / Dart", /\b(?:flutter|dart)\b/i],
];

function matchRole(p, description) {
  const jd = String(description).slice(0, 20000);
  const hits = TERMS.filter(([, re]) => re.test(jd));
  const gaps = NOT_LISTED.filter(([, re]) => re.test(jd)).map(([label]) => label);

  /* Everything citable, with where it comes from. */
  const lines = [];
  for (const para of p.person.summary) lines.push({ text: para, from: "Profile" });
  for (const r of p.cv.experience) {
    for (const point of r.points) lines.push({ text: point, from: `${r.title}, ${r.org} (${r.start} – ${r.end})` });
    lines.push({ text: `Stack: ${r.stack.join(", ")}`, from: `${r.title}, ${r.org}` });
  }
  for (const w of p.projects) lines.push({ text: `${w.summary} Stack: ${w.stack.join(", ")}.`, from: `Project: ${w.title} (${w.caseStudy})` });
  for (const s of p.skills) for (const line of s.practice) lines.push({ text: line, from: `Skill: ${s.title}` });
  for (const a of p.cv.awards) lines.push({ text: `${a.name}, ${a.event}, ${a.year}. ${a.detail}`, from: "Award" });
  for (const e of p.cv.education) lines.push({ text: `${e.award}, ${e.school}. ${e.detail ?? ""}`, from: "Education" });
  for (const g of p.cv.skills) lines.push({ text: `${g.group}: ${g.items.join(", ")}`, from: "Skills" });

  const scored = lines
    .map((l) => ({ ...l, terms: hits.filter(([, re]) => re.test(l.text)).map(([label]) => label) }))
    .filter((l) => l.terms.length)
    .sort((a, b) => b.terms.length - a.terms.length);

  const evidence = [];
  const seen = new Set();
  for (const l of scored) {
    if (seen.has(l.text) || evidence.length >= 10) continue;
    seen.add(l.text);
    evidence.push(`- ${l.text}\n  (${l.from}; matches ${l.terms.join(", ")})`);
  }

  const unmatched = hits.map(([label]) => label).filter((label) => !scored.some((l) => l.terms.includes(label)));
  return [
    "# How Dylan's record lines up with this description",
    "Keyword evidence, not a verdict: what the description mentions that his CV, projects and skills also show, with where each piece comes from. Judge the fit from the evidence.",
    hits.length ? `**Mentioned in the description and on his record:** ${hits.map(([l]) => l).join(", ")}.` : "Nothing in the description matched terms on his record.",
    evidence.length ? `## Evidence, strongest first\n\n${evidence.join("\n")}` : "",
    unmatched.length ? `**Mentioned, but with no specific line of evidence:** ${unmatched.join(", ")}.` : "",
    gaps.length
      ? `**Asked for in the description and not on his CV:** ${gaps.join(", ")}.`
      : "**Not on his CV:** nothing from the common list of languages and platforms that he doesn't have.",
    `Full CV: ${p.cv.page}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/* ── Sending a message ─────────────────────────────────────────────────── */

async function sendMessage(env, request, args) {
  const name = String(args.name ?? "").trim();
  const email = String(args.email ?? "").trim();
  const message = String(args.message ?? "").trim();
  const organisation = String(args.organisation ?? "").trim().slice(0, 200);
  if (!name || !email || !message) return fail("A name, an email address and a message are all needed.");
  if (name.length > 100 || email.length > 200 || message.length > 5000) return fail("That's too long: a name up to 100 characters, a message up to 5,000.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("That email address doesn't look right.");
  if (!env.RESEND_API_KEY) return fail("Messaging isn't set up on this server. Email dylan@dylancollins.me instead.");

  if (env.RATE_LIMITER) {
    const ip = request.headers.get("CF-Connecting-IP") ?? "anon";
    const { success } = await env.RATE_LIMITER.limit({ key: `mcp:${ip}` });
    if (!success) return fail("Too many messages just now. Try again in a minute.");
  }

  const subject = headerSafe(`New enquiry via MCP from ${name}${organisation ? ` (${organisation})` : ""}`);
  const res = await sendEmail(env, {
    from: env.FROM_NOTIFY,
    to: [env.TO_EMAIL],
    reply_to: email,
    subject,
    text: `From: ${name} <${email}>${organisation ? `\nOrganisation: ${organisation}` : ""}\nSent through an AI assistant via the MCP server.\n\n${message}`,
    html: `
      <div style="background:#fafafa;padding:32px 16px;font-family:${SANS}">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5">
          <div style="height:3px;background:${ACCENT}"></div>
          <div style="padding:32px">
            <p style="margin:0 0 24px;font-family:${MONO};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT}">New enquiry, via MCP</p>
            <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111111">${escapeHtml(name)}</p>
            ${organisation ? `<p style="margin:0 0 4px;font-size:14px;color:#555555">${escapeHtml(organisation)}</p>` : ""}
            <p style="margin:0 0 24px;font-size:14px"><a href="mailto:${escapeHtml(email)}" style="color:${ACCENT};text-decoration:none">${escapeHtml(email)}</a></p>
            <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 24px" />
            <p style="margin:0;font-size:16px;line-height:1.7;color:#333333;white-space:pre-wrap">${escapeHtml(message)}</p>
            <p style="margin:28px 0 0;font-family:${MONO};font-size:11px;letter-spacing:1px;color:#6b6b6b">Sent through an AI assistant using the MCP server. Reply to this email to respond directly.</p>
          </div>
        </div>
      </div>`,
  });
  if (!res.ok) {
    console.error("MCP send_message failed:", res.status, await res.text().catch(() => ""));
    return fail("The message didn't send. Email dylan@dylancollins.me instead.");
  }
  return ok(`Sent. Dylan will reply to ${email}.`);
}

/* ── Tools ─────────────────────────────────────────────────────────────── */

const ok = (text) => ({ content: [{ type: "text", text }] });
const fail = (text) => ({ content: [{ type: "text", text }], isError: true });
const READ = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

function toolList(p) {
  const slugs = p ? p.projects.map((w) => w.slug) : undefined;
  return [
    {
      name: "about_dylan",
      title: "About Dylan",
      description: "Who Dylan Collins is: headline, current role, summary, award, links, and notes for describing him accurately. Start here.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: READ,
    },
    {
      name: "get_cv",
      title: "CV",
      description: "Dylan's CV: experience with dates and achievements, awards, education, and skills. Optionally just one section.",
      inputSchema: {
        type: "object",
        properties: {
          section: { type: "string", enum: ["all", "experience", "awards", "education", "skills"], description: "Which part of the CV. Defaults to all." },
        },
        additionalProperties: false,
      },
      annotations: READ,
    },
    {
      name: "list_projects",
      title: "Projects",
      description: "Every piece of work on dylancollins.me, with its slug, kind, year, role, stack and case study link.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: READ,
    },
    {
      name: "get_project",
      title: "Project write-up",
      description: "The full case study for one project: what it is, Dylan's part, the decisions behind it, and how it's built.",
      inputSchema: {
        type: "object",
        properties: { slug: { type: "string", ...(slugs ? { enum: slugs } : {}), description: "The project's slug, from list_projects." } },
        required: ["slug"],
        additionalProperties: false,
      },
      annotations: READ,
    },
    {
      name: "get_skills",
      title: "What Dylan does",
      description: "Dylan's five areas of work in depth (web apps, AI, front-end, automation, infrastructure): the claim, what it looks like in practice, tools, and proof.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: READ,
    },
    {
      name: "get_now",
      title: "What Dylan is doing now",
      description: "Dylan's now page: current work, what he's building, learning, reading and playing.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: READ,
    },
    {
      name: "match_role",
      title: "Match a job description",
      description:
        "Give it a job description; it returns the evidence from Dylan's CV, projects and skills that bears on it, with sources, plus anything the description asks for that he doesn't list. Evidence for you to weigh, not a verdict.",
      inputSchema: {
        type: "object",
        properties: { job_description: { type: "string", description: "The job description or role spec, as text. Up to 20,000 characters are read." } },
        required: ["job_description"],
        additionalProperties: false,
      },
      annotations: READ,
    },
    {
      name: "send_message",
      title: "Send Dylan a message",
      description:
        "Emails Dylan a message from the user, with their address as the reply-to. Only use this when the user has asked to contact Dylan and has seen and approved the exact message.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "The sender's name." },
          email: { type: "string", description: "The sender's email address, for Dylan's reply." },
          organisation: { type: "string", description: "Their company or organisation, if they gave one." },
          message: { type: "string", description: "The message, as the user approved it. Up to 5,000 characters." },
        },
        required: ["name", "email", "message"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
  ];
}

async function callTool(env, request, name, args = {}) {
  if (name === "send_message") return sendMessage(env, request, args);
  const p = await profile(env);
  switch (name) {
    case "about_dylan":
      return ok(aboutText(p));
    case "get_cv":
      return ok(cvText(p, args.section ?? "all"));
    case "list_projects":
      return ok([`# Projects (${p.projects.length})`, ...p.projects.map(projectLine), `All work: ${p.person.website}/work/`].join("\n\n"));
    case "get_project": {
      const w = p.projects.find((x) => x.slug === args.slug);
      return w ? ok(projectText(w)) : fail(`No project called "${args.slug}". Slugs: ${p.projects.map((x) => x.slug).join(", ")}.`);
    }
    case "get_skills":
      return ok(skillsText(p));
    case "get_now":
      return ok(nowText(p));
    case "match_role":
      return args.job_description ? ok(matchRole(p, args.job_description)) : fail("Paste the job description as job_description.");
    default:
      return null;
  }
}

/* ── JSON-RPC ──────────────────────────────────────────────────────────── */

const result = (id, value) => ({ jsonrpc: "2.0", id, result: value });
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

/** One message in, one response out, or null for a notification. */
async function handleMessage(msg, env, request) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    // A response or something malformed: nothing to answer unless it has an id.
    return msg && "id" in msg && !("result" in msg) && !("error" in msg) ? rpcError(msg.id, -32600, "Invalid request") : null;
  }
  const isNotification = !("id" in msg);
  if (isNotification) return null;
  const { id, method, params = {} } = msg;

  try {
    switch (method) {
      case "initialize": {
        const asked = params.protocolVersion;
        return result(id, {
          protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions: INSTRUCTIONS,
        });
      }
      case "ping":
        return result(id, {});
      case "tools/list": {
        const p = await profile(env).catch(() => null);
        return result(id, { tools: toolList(p) });
      }
      case "tools/call": {
        const out = await callTool(env, request, params.name, params.arguments ?? {});
        return out ? result(id, out) : rpcError(id, -32602, `Unknown tool: ${params.name}`);
      }
      default:
        return rpcError(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    console.error("MCP error:", method, e);
    // A tool that failed is a result the model can read; anything else is an error.
    return method === "tools/call" ? result(id, fail(`That didn't work: ${e.message}`)) : rpcError(id, -32603, "Internal error");
  }
}

export async function handleMcp(request, env) {
  const origin = request.headers.get("Origin");
  if (!originAllowed(origin)) return new Response("Forbidden", { status: 403 });
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Max-Age": "86400" } });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: { ...headers, Allow: "POST, OPTIONS" } });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(rpcError(null, -32700, "Parse error"), { status: 400, headers });
  }

  const messages = Array.isArray(body) ? body : [body];
  const responses = (await Promise.all(messages.map((m) => handleMessage(m, env, request)))).filter(Boolean);

  // Only notifications or responses: accepted, nothing to say.
  if (responses.length === 0) return new Response(null, { status: 202, headers });
  return Response.json(Array.isArray(body) ? responses : responses[0], { headers });
}
