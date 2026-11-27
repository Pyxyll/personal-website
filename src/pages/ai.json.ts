// /ai.json: the profile in lib/ai.ts, as data. The MCP server reads this.
import type { APIRoute } from "astro";
import { aiProfile } from "../lib/ai";

export const prerender = true;

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await aiProfile(), null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
