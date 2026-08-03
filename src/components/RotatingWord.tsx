/**
 * One word in a headline that cycles through a set, swapped by a real shader.
 *
 * Each word is drawn once to an offscreen canvas using the headline's own
 * computed type, then handed to WebGL as a texture. The swap runs a fragment
 * shader that advects both textures along a noise field and dissolves between
 * them, so the outgoing word is pulled apart into grain and the incoming one
 * condenses out of it.
 *
 * The canvas only exists during the swap. At rest the DOM text is what you
 * see: crisp, hinted, selectable, and costing nothing. Handing a headline
 * permanently to a canvas would trade all of that away for an effect that is
 * only on screen for half a second at a time.
 *
 * Words are different lengths, so the container's width animates alongside the
 * swap — otherwise everything after it snaps sideways on every tick.
 *
 * The cycling copy is hidden from the accessibility tree with a stable word
 * exposed beside it: a heading whose text changes under you is worse than one
 * that reads the same every time.
 */
import { useEffect, useRef, useState } from "react";
import { ShaderMount, type PaperShaderElement } from "@paper-design/shaders-react";

const SWAP_MS = 620;

/**
 * Advection + dissolve.
 *
 * Only the alpha channel of each texture is read — the words are drawn white
 * and tinted here — which keeps compositing free of the colour fringing you
 * get blending two straight-alpha samples.
 */
const FRAGMENT = `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec4 u_color;

out vec4 fragColor;

/* Ordered 4x4 Bayer, the same matrix and the same 2px cell the hero's
   dithering shader runs on, so the two read as one technique. */
const float BAYER[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);

float bayer4(vec2 px) {
  int x = int(mod(px.x, 4.0));
  int y = int(mod(px.y, 4.0));
  return (BAYER[y * 4 + x] + 0.5) / 16.0;
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/* Outside the texture there is nothing, and the default wrap mode is REPEAT —
   without this the word tiles back into frame as the smear pushes past. */
float alphaAt(sampler2D tex, vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  return texture(tex, uv).a;
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y);
  float p = clamp(u_progress, 0.0, 1.0);

  // Coarse noise carries the dissolve front, fine noise gives it grain.
  float coarse = vnoise(uv * vec2(9.0, 4.0) + u_time * 0.20);
  float fine = vnoise(uv * vec2(42.0, 19.0) - u_time * 0.35);
  float field = mix(coarse, fine, 0.35);

  // Tilt the front across x so the change sweeps rather than fizzing in place.
  float front = p * 1.5 - 0.25 + (uv.x - 0.5) * 0.35;
  float mask = smoothstep(front - 0.22, front + 0.22, field);

  vec2 dir = vec2(1.0, 0.14);
  vec2 offOut = dir * (field - 0.5) * 0.26 * p;
  vec2 offIn = -dir * (field - 0.5) * 0.26 * (1.0 - p);

  float aFrom = alphaAt(u_from, uv + offOut) * (1.0 - smoothstep(0.55, 1.0, p));
  float aTo = alphaAt(u_to, uv + offIn) * smoothstep(0.0, 0.45, p);

  float alpha = mix(aTo, aFrom, mask);

  /* Dither hardest through the middle of the swap and not at all at either
     end: the last frame has to match the DOM text it hands back to, and a
     thresholded edge there would show as a pop. */
  float grit = sin(p * 3.14159265);
  float cell = 2.0 * u_pixelRatio;
  float threshold = bayer4(floor(gl_FragCoord.xy / cell));
  alpha = mix(alpha, step(threshold, alpha), grit);

  fragColor = vec4(u_color.rgb * alpha, alpha);
}`;

interface Props {
  /** First entry is the server-rendered word and the accessible one. */
  words: string[];
  /** Time each word is held, ms. */
  interval?: number;
}

/** Accepts whatever getComputedStyle hands back: rgb(), rgba() or a hex. */
function toRgba(css: string): [number, number, number, number] {
  const s = css.trim();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
      1,
    ];
  }
  const n = s.match(/[\d.]+/g);
  if (!n || n.length < 3) return [1, 1, 1, 1];
  return [+n[0] / 255, +n[1] / 255, +n[2] / 255, n[3] === undefined ? 1 : +n[3]];
}

export default function RotatingWord({ words, interval = 2600 }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<PaperShaderElement | null>(null);

  const [ready, setReady] = useState<{
    w: number;
    h: number;
    pad: number;
    top: number;
    color: [number, number, number, number];
    images: HTMLImageElement[];
  } | null>(null);

  const state = useRef({ widths: [] as number[], index: 0, raf: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text || words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;

    const build = async () => {
      const cs = getComputedStyle(text);
      const size = parseFloat(cs.fontSize);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Room either side for the smear to travel into.
      const pad = size * 0.45;
      const padY = size * 0.4;
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return;
      probe.font = font;
      if ("letterSpacing" in probe) probe.letterSpacing = cs.letterSpacing;
      const widths = words.map((word) => probe.measureText(word).width);
      const w = Math.max(...widths) + pad * 2;

      // Align on the baseline, not the box centre. Canvas "middle" is the
      // middle of the em box, which is not where an inline box's centre sits —
      // that mismatch is what floated the shader above the text.
      const fm = probe.measureText("Hxg");
      const ascent = fm.fontBoundingBoxAscent || fm.actualBoundingBoxAscent || size * 0.8;
      const descent = fm.fontBoundingBoxDescent || fm.actualBoundingBoxDescent || size * 0.25;
      const h = ascent + descent + padY * 2;
      const drawBaseline = padY + ascent;

      // An empty zero-height inline-block takes its baseline from its bottom
      // margin edge, so it lands exactly on the line's baseline.
      const marker = document.createElement("span");
      marker.style.cssText = "display:inline-block;width:0;height:0;overflow:hidden;";
      wrap.appendChild(marker);
      const baselineY =
        marker.getBoundingClientRect().bottom - wrap.getBoundingClientRect().top;
      marker.remove();
      const top = baselineY - drawBaseline;

      // Every word is drawn into the same box, so both textures share one UV
      // space and the shader can sample them against each other directly.
      const images = await Promise.all(
        words.map(
          (word) =>
            new Promise<HTMLImageElement>((resolve) => {
              const c = document.createElement("canvas");
              c.width = Math.ceil(w * dpr);
              c.height = Math.ceil(h * dpr);
              const ctx = c.getContext("2d")!;
              ctx.scale(dpr, dpr);
              ctx.font = font;
              if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing;
              ctx.textBaseline = "alphabetic";
              ctx.fillStyle = "#ffffff"; // alpha is all the shader reads
              ctx.fillText(word, pad, drawBaseline);
              const img = new Image();
              img.onload = () => resolve(img);
              img.src = c.toDataURL();
            })
        )
      );

      if (cancelled) return;
      state.current.widths = widths;
      wrap.style.width = `${widths[0]}px`;
      setReady({ w, h, pad, top, color: toRgba(cs.color), images });
    };

    // Widths measured before the webfont lands would all be wrong.
    if (document.fonts?.ready) document.fonts.ready.then(build);
    else build();

    return () => {
      cancelled = true;
      cancelAnimationFrame(state.current.raf);
    };
  }, [words]);

  useEffect(() => {
    if (!ready) return;
    const wrap = wrapRef.current;
    const text = textRef.current;
    const host = hostRef.current;
    if (!wrap || !text || !host) return;

    const swap = () => {
      const s = state.current;
      const mount = host.paperShaderMount;
      if (!mount) return;

      const to = (s.index + 1) % words.length;
      mount.setUniforms({
        u_from: ready.images[s.index],
        u_to: ready.images[to],
        u_progress: 0,
      });
      mount.setSpeed(1);
      host.style.opacity = "1";
      wrap.style.width = `${s.widths[to]}px`;

      const began = performance.now();
      let handedOver = false;

      const step = (now: number) => {
        const p = Math.min(1, (now - began) / SWAP_MS);
        mount.setUniforms({ u_progress: p });

        // Hide the DOM text a frame *after* the canvas has painted its first
        // frame, or there is a single blank frame between the two.
        if (!handedOver) {
          handedOver = true;
          text.style.visibility = "hidden";
        }

        if (p < 1) {
          s.raf = requestAnimationFrame(step);
          return;
        }
        s.index = to;
        text.textContent = words[to];
        text.style.visibility = "";
        host.style.opacity = "0";
        mount.setSpeed(0); // stops the render loop while nothing is moving
      };

      s.raf = requestAnimationFrame(step);
    };

    const id = window.setInterval(swap, interval);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(state.current.raf);
    };
  }, [ready, words, interval]);

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span ref={wrapRef} className="rotword" aria-hidden="true">
        <span ref={textRef} className="rotword-text">
          {words[0]}
        </span>
        {ready && (
          <ShaderMount
            ref={hostRef}
            className="rotword-canvas"
            fragmentShader={FRAGMENT}
            speed={0}
            width={ready.w}
            height={ready.h}
            style={{ left: `${-ready.pad}px`, top: `${ready.top}px` }}
            uniforms={{
              u_from: ready.images[0],
              u_to: ready.images[0],
              u_progress: 0,
              u_color: ready.color,
            }}
          />
        )}
      </span>
    </>
  );
}
