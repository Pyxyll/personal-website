// /llms-full.txt: everything on the site about me, as one markdown file, for
// an AI tool that would rather read one document than crawl pages.
import type { APIRoute } from "astro";
import { aiProfile, profileMarkdown } from "../lib/ai";

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(profileMarkdown(await aiProfile()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
