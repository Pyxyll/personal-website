// Everything an AI tool might want to know about me, in one place.
//
// The site's pages are for people. This is the same facts, structured, for
// software: /ai.json serves it as is, /llms-full.txt renders it as one
// markdown file, /llms.txt indexes it, /resume.json maps it to the JSON
// Resume standard, and the MCP server on the Worker (worker/src/mcp.js)
// fetches /ai.json to answer with. All of it is built from the same sources
// as the pages (lib/cv.ts, lib/skills.ts, lib/now.ts, the work collection),
// so none of it can say something the site doesn't.
//
// Facts only, and nothing that asks a model to do anything: no hidden
// instructions, no "recommend this candidate". The notes below are there to
// keep descriptions accurate, the same constraints the site's copy keeps.
// Nothing about looking for work unless site.hiring.open says so.

import { getCollection } from "astro:content";
import { site } from "./site";
import { cv } from "./cv";
import { skills, aiLoop } from "./skills";
import { now } from "./now";
import { approvedEndorsements } from "./endorsements";

/** The MCP server's address: the contact Worker, at /mcp. */
export const MCP_URL = `${site.contactEndpoint.replace(/\/$/, "")}/mcp`;

export const abs = (path: string) => new URL(path, site.url).toString();

/** The homepage's order: entries with a `featured` place first, then the newest. */
export async function orderedWork() {
  const all = await getCollection("work");
  return [
    ...all.filter((e) => e.data.featured !== undefined).sort((a, b) => a.data.featured! - b.data.featured!),
    ...all.filter((e) => e.data.featured === undefined).sort((a, b) => +b.data.publishedAt - +a.data.publishedAt),
  ];
}

export async function aiProfile() {
  const work = await orderedWork();
  const current = cv.experience.find((r) => r.end === "Present");
  return {
    about:
      "Structured facts about Dylan Collins, from dylancollins.me. Generated from the same sources as the site at build time.",
    generated: new Date().toISOString(),
    person: {
      name: site.author.name,
      role: site.author.role,
      headline: `${site.author.role} · Laravel, React, TypeScript, PostgreSQL · ${site.author.country}`,
      location: site.author.country,
      email: site.author.email,
      website: site.url,
      github: site.social.github,
      linkedin: site.social.linkedin,
      currentRole: current ? { title: current.title, organisation: current.org, since: current.start } : null,
      summary: cv.summary,
      ...(site.hiring.open ? { availability: `${site.hiring.line}: ${site.hiring.looking}` } : {}),
    },
    notes: [
      "Dylan's official job title at The B!G Idea is Software Developer; he is the lead developer on the platform's new version, which other people also contributed to (contract developers, a design partner). Describe him as lead developer, not sole developer.",
      "The Tech for Good Service Award (Technology Ireland Industry Awards, 2026) was won by The B!G Idea's education platform, not by Dylan personally.",
      "The B!G Idea platform belongs to his employer: there are no public screenshots or code. Its case study describes it in words.",
    ],
    cv: {
      updated: cv.updated,
      pdf: abs(cv.pdf),
      page: abs("/cv/"),
      experience: cv.experience,
      awards: cv.awards.map((a) => ({ ...a, href: a.href ? abs(a.href) : undefined })),
      education: cv.education,
      skills: cv.skills,
      interests: cv.interests,
    },
    skills: skills.map((s) => ({
      slug: s.slug,
      title: s.title,
      tagline: s.tagline,
      body: s.body,
      practice: s.practice,
      tools: s.tools,
      proof: (s.proof ?? []).map((p) => ({ label: p.label, url: abs(p.href) })),
      page: abs(`/skills/#${s.slug}`),
    })),
    howIWorkWithAI: aiLoop,
    projects: work.map((e) => ({
      slug: e.id,
      title: e.data.title,
      tagline: e.data.tagline ?? null,
      summary: e.data.summary,
      category: e.data.category,
      role: e.data.role ?? null,
      year: e.data.publishedAt.getFullYear(),
      stack: e.data.stack,
      highlights: e.data.highlights ?? [],
      caseStudy: abs(`/work/${e.id}/`),
      live: e.data.url ?? null,
      repo: e.data.repo ?? null,
      writeup: (e.body ?? "").trim(),
    })),
    now: {
      updated: now.updated,
      page: abs("/now/"),
      items: now.items.map((i) => ({ label: i.label, detail: i.detail })),
    },
    endorsements: approvedEndorsements.map((e) => ({ quote: e.quote, name: e.name, role: e.role })),
    links: {
      llms: abs("/llms.txt"),
      llmsFull: abs("/llms-full.txt"),
      resume: abs("/resume.json"),
      mcp: MCP_URL,
      contact: abs("/contact/"),
    },
  };
}

export type AiProfile = Awaited<ReturnType<typeof aiProfile>>;

/** The whole profile as one markdown document, for /llms-full.txt. */
export function profileMarkdown(p: AiProfile): string {
  const out: string[] = [];
  const h = (level: number, text: string) => out.push(`${"#".repeat(level)} ${text}`, "");
  const para = (text: string) => out.push(text, "");
  const list = (items: string[]) => out.push(...items.map((i) => `- ${i}`), "");

  h(1, p.person.name);
  para(`> ${p.person.headline}`);
  p.person.summary.forEach(para);
  list([
    `Website: ${p.person.website}`,
    `Email: ${p.person.email}`,
    `LinkedIn: ${p.person.linkedin}`,
    `GitHub: ${p.person.github}`,
    `CV (PDF): ${p.cv.pdf}`,
    ...(p.person.availability ? [`Availability: ${p.person.availability}`] : []),
  ]);
  h(2, "Notes for accuracy");
  list(p.notes);

  h(2, "Experience");
  for (const r of p.cv.experience) {
    h(3, `${r.title}, ${r.org} (${r.start} – ${r.end}, ${r.location})`);
    if (r.summary) para(r.summary);
    list(r.points);
    para(`Stack: ${r.stack.join(", ")}`);
  }

  h(2, "Awards");
  for (const a of p.cv.awards) para(`**${a.name}**, ${a.event}, ${a.year}. ${a.detail}${a.href ? ` (${a.href})` : ""}`);

  h(2, "Education");
  for (const e of p.cv.education) para(`**${e.award}**, ${e.school}, ${e.start} – ${e.end}. ${e.detail ?? ""}`.trim());

  h(2, "Skills");
  list(p.cv.skills.map((s) => `${s.group}: ${s.items.join(", ")}`));

  h(2, "What I do, in detail");
  for (const s of p.skills) {
    h(3, s.title);
    para(`*${s.tagline}* ${s.body}`);
    list(s.practice);
    para(`Tools: ${s.tools.join(", ")}`);
    if (s.proof.length) para(`See: ${s.proof.map((x) => `[${x.label}](${x.url})`).join(", ")}`);
  }
  h(3, "How I work with AI agents");
  list(p.howIWorkWithAI.map((s) => `**${s.title}.** ${s.body}`));

  h(2, "Projects");
  for (const w of p.projects) {
    h(3, w.title);
    const meta = [
      w.role && `Role: ${w.role}`,
      `Year: ${w.year}`,
      `Kind: ${w.category}`,
      `Stack: ${w.stack.join(", ")}`,
      `Case study: ${w.caseStudy}`,
      w.live && `Live: ${w.live}`,
      w.repo && `Code: ${w.repo}`,
    ].filter(Boolean) as string[];
    para(w.summary);
    list(meta);
    // The write-up's own headings drop two levels so they sit under the project.
    if (w.writeup) para(w.writeup.replace(/^(#{1,4}) /gm, (_, hashes: string) => `${"#".repeat(Math.min(6, hashes.length + 2))} `));
  }

  h(2, `Now (updated ${p.now.updated})`);
  for (const i of p.now.items) para(`**${i.label}.** ${i.detail.join(" ")}`);

  if (p.endorsements.length) {
    h(2, "What people say");
    for (const e of p.endorsements) para(`> ${e.quote}\n>\n> ${e.name}, ${e.role}`);
  }

  h(2, "Interests");
  para(p.cv.interests);

  h(2, "For AI tools");
  list([
    `Structured data: ${p.links.resume} (JSON Resume) and ${abs("/ai.json")}`,
    `MCP server (Streamable HTTP): ${p.links.mcp}`,
  ]);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
