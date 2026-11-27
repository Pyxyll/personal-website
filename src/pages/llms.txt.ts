// /llms.txt, after llmstxt.org: a short markdown index for AI tools. A title,
// a one-line summary, a few lines of context, then sections of links with a
// note on each. The full text is in /llms-full.txt.
import type { APIRoute } from "astro";
import { aiProfile, abs } from "../lib/ai";

export const prerender = true;

export const GET: APIRoute = async () => {
  const p = await aiProfile();
  const award = p.cv.awards[0];
  const lines = [
    `# ${p.person.name}`,
    "",
    `> ${p.person.role} in ${p.person.location}, working mainly in Laravel, React, TypeScript and PostgreSQL.${
      p.person.currentRole ? ` ${p.person.currentRole.title} at ${p.person.currentRole.organisation}, and lead developer on its education platform.` : ""
    }`,
    "",
    [
      award && `The platform won the ${award.name} at the ${award.event}, ${award.year}.`,
      "More than ten years of building for the web and running the systems underneath; first class honours in Multimedia Applications Development from SETU Waterford.",
    ]
      .filter(Boolean)
      .join(" "),
    "",
    ...p.notes.map((n) => `- ${n}`),
    "",
    "## CV",
    "",
    `- [CV](${p.cv.page}): profile, experience, awards, education and skills`,
    `- [CV as PDF](${p.cv.pdf}): the same, two pages, A4`,
    `- [Résumé as JSON](${p.links.resume}): the CV in the JSON Resume format`,
    "",
    "## Work",
    "",
    ...p.projects.map((w) => `- [${w.title}](${w.caseStudy}): ${w.summary}`),
    "",
    "## What I do",
    "",
    ...p.skills.map((s) => `- [${s.title}](${s.page}): ${s.tagline}`),
    "",
    "## About",
    "",
    `- [Now](${p.now.page}): what I'm focused on at the moment, updated ${p.now.updated}`,
    `- [Contact](${p.links.contact}): email ${p.person.email}, or the form`,
    "",
    "## For AI tools",
    "",
    `- [Everything in one file](${p.links.llmsFull}): the CV, every case study, skills and now, as markdown`,
    `- [Structured data](${abs("/ai.json")}): the same, as JSON`,
    `- [MCP server](${p.links.mcp}): Streamable HTTP, no sign-in. Tools: about_dylan, get_cv, list_projects, get_project, get_skills, get_now, match_role (evidence for a job description) and send_message`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
