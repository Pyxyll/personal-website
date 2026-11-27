// /resume.json: the CV in the JSON Resume format (jsonresume.org), which
// hiring tools and resume themes read. Same source as /cv/.
import type { APIRoute } from "astro";
import { aiProfile } from "../lib/ai";

export const prerender = true;

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/** "Jun 2024" to "2024-06"; "2022" stays "2022"; "Present" is left out. */
const isoDate = (text: string) => {
  const m = /^(?:([A-Za-z]{3})[A-Za-z]*\.?\s+)?(\d{4})$/.exec(text.trim());
  if (!m) return undefined;
  if (!m[1]) return m[2];
  const i = MONTHS.indexOf(m[1].toLowerCase());
  return i < 0 ? m[2] : `${m[2]}-${String(i + 1).padStart(2, "0")}`;
};

export const GET: APIRoute = async () => {
  const p = await aiProfile();
  const resume = {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: p.person.name,
      label: p.person.headline,
      email: p.person.email,
      url: p.person.website,
      summary: p.person.summary.join("\n\n"),
      location: { countryCode: "IE" },
      profiles: [
        { network: "LinkedIn", username: p.person.linkedin.replace(/\/$/, "").split("/").pop(), url: p.person.linkedin },
        { network: "GitHub", username: p.person.github.replace(/\/$/, "").split("/").pop(), url: p.person.github },
      ],
    },
    work: p.cv.experience.map((r) => ({
      name: r.org,
      position: r.title,
      ...(r.orgUrl ? { url: r.orgUrl } : {}),
      location: r.location,
      startDate: isoDate(r.start),
      ...(r.end !== "Present" ? { endDate: isoDate(r.end) } : {}),
      ...(r.summary ? { summary: r.summary } : {}),
      highlights: r.points,
    })),
    education: p.cv.education.map((e) => ({
      institution: e.school,
      area: e.award.replace(/^BSc in /, ""),
      studyType: e.level ? `BSc (${e.level})` : "BSc",
      startDate: isoDate(e.start),
      endDate: isoDate(e.end),
      ...(e.result ? { score: e.result } : {}),
    })),
    awards: p.cv.awards.map((a) => ({ title: a.name, date: a.year, awarder: a.event, summary: a.detail, ...(a.source ? { url: a.source.href } : {}) })),
    skills: p.cv.skills.map((s) => ({ name: s.group, keywords: s.items })),
    projects: p.projects.map((w) => ({
      name: w.title,
      description: w.summary,
      url: w.live ?? w.caseStudy,
      keywords: w.stack,
      ...(w.role ? { roles: [w.role] } : {}),
    })),
    interests: p.cv.interests
      .replace(/\.$/, "")
      .split(/,\s*(?:and\s+)?/)
      .map((name) => ({ name: name.replace(/^and\s+/, "") })),
    meta: { canonical: new URL("/resume.json", p.person.website).toString(), lastModified: p.cv.updated },
  };
  return new Response(JSON.stringify(resume, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
