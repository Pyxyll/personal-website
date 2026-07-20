/**
 * Open Graph card for the Nerd-Up Collective concept.
 *
 * Deliberately not the site's own renderOg(): that card is branded for this
 * portfolio, and a link the shop forwards to a business partner should show
 * *their* shop, not mine. Photo-led for the same reason — a collectibles shop
 * sells objects, and the wall of cartridges does more work than any wordmark.
 *
 * Same technique as lib/og.ts: hand-rolled SVG rasterised by Resvg, so the
 * photo can be composited without pulling in an image library.
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shop } from "../../../components/nerdup/data";

export const prerender = true;

const W = 1200;
const H = 630;

const esc = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export async function GET() {
  const ACCENT = "#E8B23A";
  const INK = "#111111";
  const CREAM = "#F7F3EA";

  const SANS =
    "Inter, 'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif";
  const MONO =
    "'JetBrains Mono', 'IBM Plex Mono', 'Liberation Mono', 'DejaVu Sans Mono', monospace";

  // Inline the photo so Resvg needs no network or asset resolution. Resolved
  // from the project root explicitly — the Docker build runs `astro build` from
  // WORKDIR, and a bare relative path here would depend on that staying true.
  const photo = readFileSync(
    join(process.cwd(), "public/demos/nerd-up/shane-hero.jpg")
  ).toString("base64");

  const tri = (x: number, y: number, w: number, h: number, fill: string) =>
    `<polygon points="${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}" fill="${fill}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#111111" stop-opacity="0.15"/>
      <stop offset="45%" stop-color="#111111" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#111111" stop-opacity="0.94"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${INK}"/>
  <image href="data:image/jpeg;base64,${photo}" x="0" y="0" width="${W}" height="${H}"
         preserveAspectRatio="xMidYMid slice"/>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>

  <!-- wordmark -->
  ${tri(72, 402, 30, 27, ACCENT)}
  <text x="116" y="428" font-family="${SANS}" font-size="34" font-weight="700"
        letter-spacing="-0.5" fill="${CREAM}">NERD-UP</text>
  <text x="118" y="452" font-family="${MONO}" font-size="13"
        letter-spacing="9" fill="${ACCENT}">COLLECTIVE</text>

  <!-- headline -->
  <text x="72" y="522" font-family="${SANS}" font-size="52" font-weight="700"
        letter-spacing="-1.6" fill="${CREAM}">Retro games, VHS, comics &amp; vinyl</text>

  <!-- location -->
  <text x="72" y="566" font-family="${MONO}" font-size="19"
        letter-spacing="1.4" fill="#cfc8b8">${esc(
          `${shop.venue}, ${shop.street}, ${shop.town}`
        )}</text>

  <!-- accent rule -->
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${ACCENT}"/>
</svg>`;

  // loadSystemFonts is off by default — without it every family in the stack
  // misses and the card silently falls back to a monospace default.
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    background: INK,
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "DejaVu Sans",
    },
  })
    .render()
    .asPng();

  // Resvg hands back a Node Buffer; Response wants a plain byte view.
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
