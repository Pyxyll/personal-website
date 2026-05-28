import type { APIContext } from "astro";
import { renderIcon } from "../lib/icon";

export const prerender = true;

export async function GET(_ctx: APIContext) {
  const png = await renderIcon(512);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
