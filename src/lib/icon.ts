// Brand icon renderer — same SVG source rasterised at multiple sizes for
// favicons, apple-touch-icon, and PWA manifest icons.
import { Resvg } from "@resvg/resvg-js";

// SVG source for the icon. Geometry is laid out in a 64×64 viewBox; Resvg
// scales to whatever size we render at without pixelation.
//
// Layout: black square, white "D" centred-ish, pink dot to the right of it.
function iconSvg(size: number) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0a0a0a"/>
  <text
    x="32"
    y="46"
    text-anchor="middle"
    font-family="Inter, 'Helvetica Neue', Helvetica, Arial, 'DejaVu Sans', sans-serif"
    font-weight="900"
    font-size="44"
    fill="#fafafa"
    letter-spacing="-2"
  >D</text>
  <circle cx="52" cy="50" r="4" fill="#da2862"/>
</svg>`;
}

export async function renderIcon(size: number, opts?: { background?: string }): Promise<Uint8Array<ArrayBuffer>> {
  const png = new Resvg(iconSvg(size), {
    fitTo: { mode: "width", value: size },
    background: opts?.background ?? "#0a0a0a",
    font: { loadSystemFonts: true, defaultFontFamily: "DejaVu Sans" },
  })
    .render()
    .asPng();
  return new Uint8Array(png);
}
