import type { APIContext } from "astro";
import { renderOg } from "../lib/og";
import { site } from "../lib/site";

export const prerender = true;

export async function GET(_ctx: APIContext) {
  const png = await renderOg({
    eyebrow: "Portfolio",
    title: "Dylan Collins",
    subtitle: site.description,
  });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
