// Open Graph image renderer. Hand-rolled SVG, rasterised to PNG via
// @resvg/resvg-js. Tried satori first; it can't read the woff2 files
// fontsource ships and pulling in a TTF feels heavier than the value.
// SVG + Resvg lets us use system fonts and gives us pixel-precise control
// over the brutalist-lite layout.
import { Resvg } from "@resvg/resvg-js";
import { site } from "./site";

const W = 1200;
const H = 630;

// Escape text for safe insertion into SVG <text> nodes.
const esc = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// Greedy word wrap to N lines max, trailing ellipsis if it overflows.
function wrap(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    const lastFull = current || lines[lines.length - 1];
    if (lastFull.length > maxCharsPerLine - 1) {
      lines[maxLines - 1] = lastFull.slice(0, maxCharsPerLine - 1).trimEnd() + "…";
    }
  }
  return lines;
}

interface OgInput {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export async function renderOg({ title, subtitle, eyebrow }: OgInput): Promise<Uint8Array> {
  const ACCENT = "#da2862";
  const PAPER = "#0a0a0a";
  const INK = "#fafafa";
  const INK_DIM = "#a1a1aa";
  const INK_FAINT = "#525252";
  const RULE = "#262626";

  const SANS = "Inter, 'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif";
  const MONO = "'JetBrains Mono', 'Geist Mono', 'IBM Plex Mono', 'Liberation Mono', 'DejaVu Sans Mono', monospace";

  const titleLines = wrap(title, 16, 3);
  const subtitleLines = subtitle ? wrap(subtitle, 50, 2) : [];

  const titleSize = titleLines.length === 1 ? 132 : titleLines.length === 2 ? 110 : 88;
  const lineHeight = Math.round(titleSize * 1.02);

  const titleStartY = 280 - ((titleLines.length - 1) * lineHeight) / 2;
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="72" y="${titleStartY + i * lineHeight}" font-family="${SANS}" font-weight="900" font-size="${titleSize}" letter-spacing="-3" fill="${INK}">${esc(line)}${i === titleLines.length - 1 ? `<tspan fill="${ACCENT}">.</tspan>` : ""}</text>`
    )
    .join("\n");

  const subtitleStartY = titleStartY + (titleLines.length - 1) * lineHeight + 80;
  const subtitleSvg = subtitleLines
    .map(
      (line, i) =>
        `<text x="72" y="${subtitleStartY + i * 44}" font-family="${SANS}" font-weight="400" font-size="34" fill="${INK_DIM}">${esc(line)}</text>`
    )
    .join("\n");

  const topRight = esc(eyebrow ?? "dylancollins.me");
  const bottomDomain = esc(site.url.replace(/^https?:\/\//, ""));
  const bottomTagline = "Engineer, builder, curious";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <text x="72" y="78" font-family="${MONO}" font-weight="500" font-size="22" letter-spacing="3.5" fill="${INK_DIM}">DYLAN COLLINS</text>
  <text x="${W - 72}" y="78" text-anchor="end" font-family="${MONO}" font-weight="500" font-size="22" letter-spacing="3.5" fill="${INK_DIM}">${topRight.toUpperCase()}</text>
  ${titleSvg}
  ${subtitleSvg}
  <rect x="72" y="${H - 100}" width="${W - 144}" height="1" fill="${RULE}"/>
  <text x="72" y="${H - 60}" font-family="${MONO}" font-weight="500" font-size="20" letter-spacing="3" fill="${INK_FAINT}">${bottomDomain.toUpperCase()}</text>
  <text x="${W - 72}" y="${H - 60}" text-anchor="end" font-family="${MONO}" font-weight="500" font-size="20" letter-spacing="3" fill="${INK_FAINT}">${bottomTagline.toUpperCase()}</text>
</svg>`;

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    background: PAPER,
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "DejaVu Sans",
    },
  })
    .render()
    .asPng();

  return new Uint8Array(png);
}
