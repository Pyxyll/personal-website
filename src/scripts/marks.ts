/**
 * The motion behind the service schematics (components/ServiceSketch.astro).
 *
 * Motion here is editorial pacing, not spectacle. One easing curve throughout
 * (0.4, 0, 0.2, 1), durations of a few hundred milliseconds, nothing that
 * bounces or balloons. Things draw, travel, change state and rest.
 *
 * Every mark gets the same entry and its own loop:
 *
 *   entry   the drawing draws itself. Stroked parts draw on in document
 *           order, then the flows, fills and labels fade in. About 1.5s.
 *   loop    the service's verb, as a flow: a dot along a line, a node
 *           changing colour, a value measured out. Then a rest of a few
 *           seconds, because six of these share the homepage and the
 *           difference between alive and busy is mostly how often anything
 *           moves.
 *
 * Both sit in one master per mark, which the visibility observer plays and
 * pauses, so a mark draws itself the first time it is seen and costs nothing
 * once it has scrolled away.
 *
 * The script also keeps the monoline honest: a ResizeObserver sets --sw on
 * each figure to the user-unit stroke width that renders as 1.5px, so the
 * line weight is the same on the homepage plate and the services page.
 *
 * ── Conventions ──────────────────────────────────────────────────────────
 *   - Parts the loops touch carry data-el. The entry works from the palette
 *     classes (.m-*, .f-*, .flow, .lbl) so a new mark needs no entry code.
 *   - from/fromTo tweens render their start state as soon as the timeline is
 *     built. That is relied on: it is what puts every part at zero before the
 *     figure is unhidden (.is-ready). Loops use to() for anything the entry
 *     positioned, so building a loop does not disturb the finished drawing.
 *   - Colours tweened in JS are read from the design tokens once.
 */
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, CustomEase);
CustomEase.create("cf", "0.4,0,0.2,1");
gsap.defaults({ ease: "cf" });

type Timeline = gsap.core.Timeline;
/** The figure's own drawing colours, read from its --mk-* tokens. */
interface Palette {
  ink: string;
  rule: string;
}
type Builder = (svg: SVGSVGElement, c: Palette) => Timeline;

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

const token = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const ACCENT = token("--color-accent", "#da2862");

const paletteOf = (fig: HTMLElement): Palette => {
  const cs = getComputedStyle(fig);
  return {
    ink: cs.getPropertyValue("--mk-ink").trim() || "#a1a1aa",
    rule: cs.getPropertyValue("--mk-rule").trim() || "#616161",
  };
};

/* ── Shared ─────────────────────────────────────────────────────────────── */

/** The drawing draws itself. Same for every mark. */
function entryFor(svg: SVGSVGElement): Timeline {
  const strokes = Array.from(
    svg.querySelectorAll<SVGGeometryElement>(".m-ink:not(.fx), .m-rule:not(.fx), .m-sig:not(.fx)"),
  );
  const fades = Array.from(svg.querySelectorAll<SVGElement>(".flow, .f-ink, .f-sig:not(.fx), .lbl"));
  const tl = gsap.timeline();
  tl.fromTo(svg.querySelector(".grid"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
    .fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.45, stagger: 0.055 }, 0.15)
    .fromTo(fades, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, ">-0.2");
  return tl;
}

/** A stroked part takes the signal colour for a beat, then gives it back. */
const blink = (tl: Timeline, target: gsap.TweenTarget, at: gsap.Position, back: string, hold = 0.35) =>
  tl.to(target, { stroke: ACCENT, duration: 0.15 }, at).to(target, { stroke: back, duration: 0.5 }, `>+=${hold}`);

const along = (path: SVGPathElement, start = 0, end = 1) => ({
  path,
  align: path,
  alignOrigin: [0.5, 0.5] as [number, number],
  start,
  end,
});

/* ── The six loops ──────────────────────────────────────────────────────── */

const loops: Record<string, Builder> = {
  /* The cursor arrives from off the page, the button takes the click. */
  website(svg, c) {
    const q = gsap.utils.selector(svg);
    const cursor = q("[data-el=cursor]");
    const cta = q("[data-el=cta]");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.6 });
    tl.fromTo(cursor, { x: 48, y: 26, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.7 }, 0);
    blink(tl, cta, 0.75, c.ink);
    tl.to(cursor, { opacity: 0, duration: 0.3 }, 1.6);
    return tl;
  },

  /* New rows arrive: the bars take new heights, the reading ticks. */
  app(svg) {
    const q = gsap.utils.selector(svg);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.9, repeatRefresh: true });
    tl.to(
      q("[data-el=bar]"),
      { scaleY: () => gsap.utils.random(0.35, 1.15, 0.05), transformOrigin: "50% 100%", duration: 0.5, stagger: 0.05 },
      0,
    )
      .fromTo(q("[data-el=tip]"), { opacity: 0.25 }, { opacity: 1, duration: 0.3 }, 0.15);
    return tl;
  },

  /* The job goes round and each station takes it in turn. */
  automation(svg, c) {
    const q = gsap.utils.selector(svg);
    const ring = svg.querySelector<SVGPathElement>("[data-el=ring]")!;
    const nodes = q("[data-el=node]");
    const job = q("[data-el=job]");
    const RIDE = 2.4;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.3 });
    tl.to(job, { motionPath: along(ring), duration: RIDE }, 0)
      .to(job, { opacity: 0, duration: 0.2 }, RIDE - 0.2)
      .set(job, { motionPath: along(ring, 0, 0) }, RIDE + 0.3)
      .to(job, { opacity: 1, duration: 0.3 }, RIDE + 0.35);
    /* The arc is three quarters of a circle from the bottom right, so the left
       station sits at half its length and the top one at five sixths. */
    blink(tl, nodes[0], RIDE * 0.5 - 0.08, c.ink, 0.2);
    blink(tl, nodes[1], RIDE * 0.83 - 0.08, c.ink, 0.2);
    return tl;
  },

  /* The live light answers, and the check runs down the rack. */
  hosting(svg, c) {
    const q = gsap.utils.selector(svg);
    const lights = q("[data-el=light]");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4 });
    tl.to(q("[data-el=live]"), { opacity: 0.3, duration: 0.18 }, 0).to(q("[data-el=live]"), { opacity: 1, duration: 0.4 }, 0.18);
    blink(tl, lights[0], 0.45, c.rule, 0.15);
    blink(tl, lights[1], 0.75, c.rule, 0.15);
    return tl;
  },

  /* Three documents in, the core takes them, one shape out. */
  ai(svg, c) {
    const q = gsap.utils.selector(svg);
    const ins = Array.from(svg.querySelectorAll<SVGPathElement>("[data-el=in]"));
    const out = svg.querySelector<SVGPathElement>("[data-el=out]")!;
    const docs = q("[data-el=doc]");
    const packet = q("[data-el=packet]");
    const FEED = 0.9;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });
    docs.forEach((doc, i) => {
      const at = i * 0.16;
      tl.to(doc, { opacity: 1, duration: 0.15 }, at)
        .to(doc, { motionPath: along(ins[i]), duration: FEED }, at)
        .to(doc, { opacity: 0, duration: 0.15 }, at + FEED - 0.12);
    });
    const ARRIVE = FEED + 0.32;
    blink(tl, q("[data-el=core]"), ARRIVE - 0.1, c.ink, 0.25);
    tl.to(packet, { opacity: 1, duration: 0.15 }, ARRIVE + 0.1)
      .to(packet, { motionPath: along(out), duration: 0.6 }, ARRIVE + 0.1)
      .to(packet, { opacity: 0, duration: 0.15 }, ARRIVE + 0.58);
    blink(tl, q("[data-el=result]"), ARRIVE + 0.62, c.ink, 0.3);
    return tl;
  },

  /* The scan measures each finding out to its length, longest first. */
  audit(svg) {
    const q = gsap.utils.selector(svg);
    const bars = q("[data-el=bar]");
    const vals = q("[data-el=val]");
    const scan = q("[data-el=scan]");
    /* Bars start at x 56; the scan travels to x 140. Each bar grows at the
       scan's pace until the line reaches its end, so the line is measuring. */
    const SWEEP = 1.4, SPAN = 84;
    const ends = [80, 52, 28];
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4 });
    tl.to(bars, { scaleX: 0.12, transformOrigin: "0% 50%", duration: 0.3, stagger: 0.04 }, 0)
      .to(vals, { opacity: 0, duration: 0.2 }, 0)
      .fromTo(scan, { x: 0, opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.4)
      .to(scan, { x: SPAN, duration: SWEEP, ease: "none" }, 0.4)
      .to(scan, { opacity: 0, duration: 0.25 }, 0.4 + SWEEP - 0.05);
    ends.forEach((len, i) => {
      const reach = SWEEP * (len / SPAN);
      tl.to(bars[i], { scaleX: 1, duration: reach, ease: "none" }, 0.4).to(vals[i], { opacity: 1, duration: 0.3 }, 0.4 + reach);
    });
    return tl;
  },
};

/* ── Hover: the camera goes into the drawing ─────────────────────────────
   The drawing's box is a window. On hover the camera dollies in to about
   twice as close, and the pointer steers where it looks: the point under the
   pointer stays under the pointer, so moving across the card pans across the
   sheet. The side being looked at turns towards the viewer, the dot grid
   lags behind and the labels lead ahead, which is the parallax that makes
   it read as depth. Strokes thicken as the sheet comes closer, as a real one
   would. Only the root svg, the grid and the labels are touched, none of
   which the loops move, so nothing fights. Pointer devices only, and never
   under reduced motion. */
const hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");
const ZOOM = 2;

/* ── 3D: the marks as objects ────────────────────────────────────────────
   On a hovering, fine-pointer device without reduced motion, and with WebGL
   available, the marks that have a 3D build are handed to marks3d.ts, which
   is loaded on demand so the three.js bundle costs nothing anywhere else.
   The SVG stays in the page underneath as the fallback and is hidden once
   the canvas is up. */
const webglOk = (() => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
})();
const MARKS_3D = new Set(["website", "app", "automation", "hosting", "ai", "audit"]);
const use3d = hoverable.matches && !reduce.matches && webglOk;

function tiltFor(fig: HTMLElement, svg: SVGSVGElement) {
  const card = fig.closest<HTMLElement>("a") ?? fig.parentElement ?? fig;
  const grid = svg.querySelector(".grid");
  const labels = Array.from(svg.querySelectorAll(".lbl"));
  const track = { duration: 0.45, ease: "cf" };

  gsap.set(svg, { transformPerspective: 700, transformOrigin: "50% 50%" });
  const rotX = gsap.quickTo(svg, "rotationX", track);
  const rotY = gsap.quickTo(svg, "rotationY", track);
  /* Percent of the sheet's own size, so the look-around is the same at any
     rendered width: at ZOOM 2 the full range reaches both edges exactly. */
  const lookX = gsap.quickTo(svg, "xPercent", track);
  const lookY = gsap.quickTo(svg, "yPercent", track);
  const farX = grid && gsap.quickTo(grid, "x", track);
  const farY = grid && gsap.quickTo(grid, "y", track);
  const nearX = labels.length ? gsap.quickTo(labels, "x", track) : null;
  const nearY = labels.length ? gsap.quickTo(labels, "y", track) : null;

  card.addEventListener("pointerenter", () => gsap.to(svg, { scale: ZOOM, duration: 0.8, ease: "cf" }));
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    lookX(-px * 100 * (ZOOM - 1));
    lookY(-py * 100 * (ZOOM - 1));
    rotY(-px * 14);
    rotX(py * 10);
    farX?.(-px * 10);
    farY?.(-py * 8);
    nearX?.(px * 6);
    nearY?.(py * 4);
  });
  card.addEventListener("pointerleave", () => {
    gsap.to(svg, { scale: 1, duration: 0.7, ease: "cf" });
    rotX(0); rotY(0); lookX(0); lookY(0);
    farX?.(0); farY?.(0); nearX?.(0); nearY?.(0);
  });
}

/* ── Wiring ────────────────────────────────────────────────────────────── */

const figures = Array.from(document.querySelectorAll<HTMLElement>("figure[data-mark]"));

/* 1.5px at any size: the viewBox is 200 wide, so the user-unit width that
   renders as 1.5px is 1.5 * 200 / rendered width. Runs for every figure,
   reduced motion included, because it is about weight rather than motion. */
const ro = new ResizeObserver((entries) => {
  for (const e of entries) {
    const w = e.contentRect.width;
    if (w > 0) (e.target as HTMLElement).style.setProperty("--sw", ((1.5 * 200) / w).toFixed(3));
  }
});
figures.forEach((fig) => ro.observe(fig));

if (reduce.matches) {
  for (const fig of figures) fig.classList.add("is-ready");
} else {
  const masters = new Map<HTMLElement, Timeline>();

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const master = masters.get(entry.target as HTMLElement);
        if (!master) continue;
        if (entry.isIntersecting) master.play();
        else master.pause();
      }
    },
    { threshold: 0.2 },
  );

  figures.forEach((fig, i) => {
    const slug = fig.dataset.mark ?? "";
    const svg = fig.querySelector("svg");
    const loopFor = loops[slug];
    if (!svg || !loopFor) {
      fig.classList.add("is-ready");
      return;
    }

    if (use3d && MARKS_3D.has(slug)) {
      import("./marks3d")
        .then(({ mount }) => {
          if (!mount(fig, slug)) throw new Error("no 3d build");
          fig.classList.add("is-ready");
        })
        .catch(() => fig.classList.add("is-ready"));
      return;
    }

    const entry = entryFor(svg);
    const loop = loopFor(svg, paletteOf(fig));

    /* Several marks in one container (the homepage plate) draw in as a short
       cascade, and all of them wait out the section's own reveal fade. */
    const siblings = fig.closest("[data-reveal]")?.querySelectorAll("figure[data-mark]").length ?? 1;
    const cascade = siblings > 1 ? (i % siblings) * 0.1 : 0;

    const master = gsap.timeline({ paused: true });
    master.add(entry, 0.3 + cascade).add(loop, ">+=0.6");
    masters.set(fig, master);

    fig.classList.add("is-ready");
    io.observe(fig);
    if (hoverable.matches) tiltFor(fig, svg);
  });

  /* If the preference flips while the page is open, stop at the finished
     drawing rather than mid-beat. */
  reduce.addEventListener("change", (e) => {
    if (!e.matches) return;
    for (const [fig, master] of masters) {
      master.kill();
      fig.querySelectorAll<SVGElement>("svg *").forEach((el) => el.removeAttribute("style"));
    }
    masters.clear();
  });
}
