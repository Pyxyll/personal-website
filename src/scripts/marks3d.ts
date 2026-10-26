/**
 * The service schematics as objects.
 *
 * Each mark is real geometry drawn as 1.5px lines over a floor of dots, so
 * the rack is three boxes and the ring is a ring. At rest the camera is a
 * long lens at the isometric angle, which makes the object read as the flat
 * schematic the SVG draws, framed exactly where the SVG sits. On hover the
 * camera moves to one composed shot per mark: closer, lower, a wider lens
 * so perspective appears. The canvas is the whole card, so the object can
 * grow out past its own box and across the card on the way there, behind
 * the copy, and come back when the pointer leaves.
 *
 * Loaded only when it can be used: a fine pointer that hovers, no reduced
 * motion, and WebGL available. Everything else gets the SVG schematic from
 * ServiceSketch.astro and the GSAP motion in marks.ts, which is also what
 * this file falls back to if it fails to load.
 *
 * ── Conventions ──────────────────────────────────────────────────────────
 *   - World units are the SVG's: a mark fits a 200 × 120 frame at rest.
 *     y is up and the floor is at y = 0 under each object.
 *   - Colours come from the figure's own --mk-* tokens, so a mark on the
 *     light plate draws in the light plate's ink.
 *   - Lines are LineMaterial fat lines in screen pixels, so the monoline is
 *     1.5px at any size and any distance. Dash lengths are in world units.
 *   - A mark's build returns its draw order for the entry, its loop timeline,
 *     and a per-frame update for anything that marches.
 */
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { gsap } from "gsap";

/* ── Palette ───────────────────────────────────────────────────────────── */

interface Palette {
  ink: string;
  rule: string;
  faint: string;
  dot: string;
  accent: string;
  /** The face colour of solids: the plate's own ground, so hidden edges hide. */
  ground: string;
}

const paletteOf = (fig: HTMLElement): Palette => {
  const cs = getComputedStyle(fig);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    ink: v("--mk-ink", "#a1a1aa"),
    rule: v("--mk-rule", "#616161"),
    faint: v("--mk-faint", "#7d7d7d"),
    dot: v("--mk-dot", "#262626"),
    accent: v("--color-accent", "#da2862"),
    ground: v("--mk-node", "#111111"),
  };
};

/* ── Primitives ─────────────────────────────────────────────────────────── */

type Vec = [number, number, number];
type Stroke = Line2 | LineSegments2;

const materials = new Set<LineMaterial>();

function lineMaterial(color: string, opts: { dashed?: boolean; width?: number } = {}) {
  const m = new LineMaterial({
    color,
    linewidth: opts.width ?? 1.5,
    worldUnits: false,
    transparent: true,
    dashed: opts.dashed ?? false,
    dashSize: 2.5,
    gapSize: 2.5,
  });
  materials.add(m);
  return m;
}

/** A polyline. */
function stroke(points: Vec[], color: string, opts: { dashed?: boolean; width?: number } = {}): Line2 {
  const g = new LineGeometry();
  g.setPositions(points.flat());
  const l = new Line2(g, lineMaterial(color, opts));
  l.computeLineDistances();
  return l;
}

/** Separate segments sharing one material, in the order given. */
function segments(pairs: [Vec, Vec][], color: string, opts: { dashed?: boolean; width?: number } = {}): LineSegments2 {
  const g = new LineSegmentsGeometry();
  g.setPositions(pairs.flat(2));
  const l = new LineSegments2(g, lineMaterial(color, opts));
  l.computeLineDistances();
  return l;
}

/** A solid in the ground colour, pushed back a hair so the edges drawn over
 *  it always win the depth test. It is what hides the far edges of a box. */
function solid(geometry: THREE.BufferGeometry, color: string) {
  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color, transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
  );
}

/** The twelve edges of a box with its base centred at (x, y, z). Edges are
 *  ordered so the draw-on runs round the base, up the posts, round the top. */
function box(w: number, d: number, h: number, at: Vec, color: string): LineSegments2 {
  const [x, y, z] = at;
  const hw = w / 2, hd = d / 2;
  const c = (dx: number, dy: number, dz: number): Vec => [x + dx * hw, y + dy * h, z + dz * hd];
  const pairs: [Vec, Vec][] = [
    [c(-1, 0, 1), c(1, 0, 1)], [c(1, 0, 1), c(1, 0, -1)], [c(1, 0, -1), c(-1, 0, -1)], [c(-1, 0, -1), c(-1, 0, 1)],
    [c(-1, 0, 1), c(-1, 1, 1)], [c(1, 0, 1), c(1, 1, 1)], [c(1, 0, -1), c(1, 1, -1)], [c(-1, 0, -1), c(-1, 1, -1)],
    [c(-1, 1, 1), c(1, 1, 1)], [c(1, 1, 1), c(1, 1, -1)], [c(1, 1, -1), c(-1, 1, -1)], [c(-1, 1, -1), c(-1, 1, 1)],
  ];
  return segments(pairs, color);
}

/** A small solid sphere: a light, a job, a signal. */
function dot(r: number, color: string, at: Vec) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, 20, 14),
    new THREE.MeshBasicMaterial({ color, transparent: true }),
  );
  m.position.set(...at);
  return m;
}

/** The floor of dots the object sits on. */
function floor(color: string, y: number, extent = 130, spacing = 10) {
  const pts: number[] = [];
  for (let x = -extent; x <= extent; x += spacing)
    for (let z = -extent; z <= extent; z += spacing) pts.push(x, y, z);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.9 }));
}

/** A mono label pinned to a point in the scene, as HTML so it stays 13px. */
interface Label {
  el: HTMLSpanElement;
  anchor: THREE.Vector3;
  /** Entry opacity, 0 until the label has faded in. */
  base: number;
}

/* ── A mark ──────────────────────────────────────────────────────────────── */

/** Where the camera goes on hover. Angles in degrees; frameH is how many
 *  world units the card's height shows at the shot, so smaller is closer;
 *  look is the world point that sits where the drawing's centre was. */
interface Shot {
  az: number;
  el: number;
  fov: number;
  frameH: number;
  look: Vec;
}

type Fadeable = THREE.Object3D & { material: THREE.Material };

interface Mark {
  group: THREE.Group;
  shot: Shot;
  /** Stroked parts in the order the entry draws them. */
  draw: Stroke[];
  /** Dashed flows, dots, fills and anything else the entry fades in, after the strokes. */
  fade: Fadeable[];
  labels: { text: string; anchor: Vec; strong?: boolean }[];
  loop: gsap.core.Timeline;
  /** Per frame: dt in seconds and t, the camera blend, 0 at rest and 1 in
   *  the shot, so a mark can do something only while the camera is in. */
  update?: (dt: number, t: number) => void;
}

type Builder = (c: Palette, withLabels: boolean) => Mark;

/* ── Shared beats ─────────────────────────────────────────────────────── */

const rgb = (hex: string) => {
  const { r, g, b } = new THREE.Color(hex);
  return { r, g, b };
};

/** A material takes the signal colour for a beat, then gives it back. */
const blink = (tl: gsap.core.Timeline, m: { color: THREE.Color }, at: number, accent: string, back: string, hold = 0.3) =>
  tl.to(m.color, { ...rgb(accent), duration: 0.15 }, at).to(m.color, { ...rgb(back), duration: 0.5 }, at + 0.15 + hold);

/** An object travels a polyline, in and out of view at the ends. */
function travel(tl: gsap.core.Timeline, obj: THREE.Mesh, points: Vec[], at: number, duration: number, ease = "cf") {
  const curve = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 1; i < points.length; i++)
    curve.add(new THREE.LineCurve3(new THREE.Vector3(...points[i - 1]), new THREE.Vector3(...points[i])));
  const prog = { p: 0 };
  const mat = obj.material as THREE.MeshBasicMaterial;
  tl.set(prog, { p: 0 }, at)
    .to(mat, { opacity: 1, duration: 0.15 }, at)
    .to(prog, { p: 1, duration, ease, onUpdate: () => obj.position.copy(curve.getPointAt(prog.p)) }, at)
    .to(mat, { opacity: 0, duration: 0.15 }, at + duration - 0.12);
}

/** Points along a flat arc on the floor, by azimuth from a0 to a1 degrees. */
function arc(r: number, y: number, a0: number, a1: number, n = 72): Vec[] {
  const pts: Vec[] = [];
  for (let i = 0; i <= n; i++) {
    const a = THREE.MathUtils.degToRad(a0 + ((a1 - a0) * i) / n);
    pts.push([r * Math.sin(a), y, r * Math.cos(a)]);
  }
  return pts;
}

/** A standing panel facing +z: a thin box with a solid face. */
function panel(w: number, h: number, at: Vec, c: Palette, depth = 2) {
  const edges = box(w, depth, h, at, c.ink);
  const fill = solid(new THREE.BoxGeometry(w, h, depth), c.ground);
  fill.position.set(at[0], at[1] + h / 2, at[2]);
  return { edges, fill };
}

/* ── The six ────────────────────────────────────────────────────────────── */

const builders: Record<string, Builder> = {
  /* A landing page standing on the floor with a plate behind it: header and
     nav, a headline, a raised button, a raised hero tile, a row of three
     tiles, and a phone standing in front carrying the same page. The cursor
     comes for the button, which presses in, and the phone's button lights
     at the same moment. */
  website(c, withLabels) {
    const group = new THREE.Group();
    const W = 100, H = 76, Z = 1.1;
    const back = panel(W, H, [6, 0, -7], c);
    (back.edges.material as LineMaterial).color.set(c.rule);
    const page = panel(W, H, [0, 0, 0], c);
    const line = (x0: number, x1: number, y: number, color = c.rule, z = Z) => stroke([[x0, y, z], [x1, y, z]], color);

    // Header: a rule, two dots, three nav items.
    const header = line(-W / 2, W / 2, H - 12, c.ink);
    const dots = [-44, -39].map((x) => dot(1.3, c.ink, [x, H - 6, Z]));
    const nav = segments([[[20, H - 6, Z], [27, H - 6, Z]], [[31, H - 6, Z], [38, H - 6, Z]], [[42, H - 6, Z], [46, H - 6, Z]]], c.rule);

    // Hero: a headline in two lines, a line of copy, and the button, raised.
    const headline = segments([[[-40, 54, Z], [2, 54, Z]], [[-40, 47, Z], [-10, 47, Z]]], c.ink);
    const copy = line(-40, 0, 39);
    const BZ = Z + 1.5;
    const cta = box(30, 3, 10, [-25, 14, BZ], c.ink);
    const ctaFill = solid(new THREE.BoxGeometry(30, 10, 3), c.ground);
    ctaFill.position.set(-25, 19, BZ);
    const button = new THREE.Group();
    button.add(ctaFill, cta);

    // Hero tile, raised, with the diagonal that marks an image.
    const tile = box(32, 2.5, 30, [26, 24, Z + 1.25], c.ink);
    const tileFill = solid(new THREE.BoxGeometry(32, 30, 2.5), c.ground);
    tileFill.position.set(26, 39, Z + 1.25);
    const tileMark = stroke([[14, 28, Z + 2.6], [38, 50, Z + 2.6]], c.rule);

    // Three tiles below the fold.
    const tiles = [-40, -10, 20].map((x) =>
      stroke([[x, 5, Z], [x + 26, 5, Z], [x + 26, 17, Z], [x, 17, Z], [x, 5, Z]], c.rule),
    );
    const tileLines = segments([-40, -10, 20].map((x) => [[x + 4, 10, Z], [x + 16, 10, Z]] as [Vec, Vec]), c.rule);

    // The phone, in front and to the right, with the same page on it.
    const PX = 52, PZ = 18, PW = 18, PH = 34, PF = PZ + 0.9;
    const phone = panel(PW, PH, [PX, 0, PZ], c, 1.5);
    const phoneHeader = line(PX - 7, PX + 7, PH - 5, c.rule, PF);
    const phoneCopy = segments([[[PX - 6, 22, PF], [PX + 6, 22, PF]], [[PX - 6, 18, PF], [PX + 2, 18, PF]]], c.rule);
    const phoneCta = stroke([[PX - 6, 6, PF], [PX + 6, 6, PF], [PX + 6, 11, PF], [PX - 6, 11, PF], [PX - 6, 6, PF]], c.ink);

    const cursor = dot(2, c.accent, [-16, 18, BZ + 2.5]);
    const leader = withLabels ? stroke([[-10, 19, BZ], [8, 19, BZ], [8, -0.5, BZ], [34, -0.5, 36]], c.rule, { dashed: true, width: 1.2 }) : null;
    const ground = floor(c.dot, 0);
    [back.fill, page.fill, tileFill, phone.fill, back.edges, page.edges, header, ...dots, nav, headline, copy, button, tile, tileMark, ...tiles, tileLines, phone.edges, phoneHeader, phoneCopy, phoneCta, cursor, ground].forEach((o) => group.add(o));
    if (leader) group.add(leader);
    group.position.y = -H / 2;

    const loop = gsap.timeline({ repeat: -1, repeatDelay: 2.6 });
    const cm = cursor.material as THREE.MeshBasicMaterial;
    loop.fromTo(cursor.position, { x: 30, y: 46 }, { x: -16, y: 18, duration: 0.7 }, 0)
      .fromTo(cm, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0)
      /* The press: the whole button sinks into the page and comes back. */
      .to(button.position, { z: -1.6, duration: 0.12 }, 0.72)
      .to(button.position, { z: 0, duration: 0.4 }, 0.84);
    blink(loop, cta.material as LineMaterial, 0.74, c.accent, c.ink);
    blink(loop, phoneCta.material as LineMaterial, 0.8, c.accent, c.ink);
    loop.to(cm, { opacity: 0, duration: 0.3 }, 1.6);

    return {
      group,
      shot: { az: 14, el: 16, fov: 30, frameH: 132, look: [4, 11, 4] },
      draw: [back.edges, page.edges, header, nav, headline, copy, cta, tile, tileMark, ...tiles, tileLines, phone.edges, phoneHeader, phoneCopy, phoneCta],
      fade: [back.fill, page.fill, ctaFill, tileFill, phone.fill, ...dots, cursor, ...(leader ? [leader] : []), ground],
      labels: [
        { text: "index.html", anchor: [-W / 2, H + 8, 0] },
        { text: "one action", anchor: [36, -0.5, 42] },
        { text: "mobile first", anchor: [PX + 13, PH + 2, PZ] },
      ],
      loop,
      update: (dt) => { if (leader) (leader.material as LineMaterial).dashOffset -= dt * 9; },
    };
  },

  /* A stack of sheets lying on the floor, piped into an internal tool
     standing beside it: header, sidebar, three figures across the top and
     two raised chart tiles. Rows leave the sheet along the pipe, and when
     they arrive the charts take new values. */
  app(c) {
    const group = new THREE.Group();
    const Y = 0.4;
    // The sheets: a 5 by 4 grid with data in some cells, on a second sheet.
    const sx0 = -88, sz0 = -6, cw = 10, rh = 12, cols = 5, rows = 4;
    const gridLines: [Vec, Vec][] = [];
    for (let i = 0; i <= cols; i++) gridLines.push([[sx0 + i * cw, Y, sz0], [sx0 + i * cw, Y, sz0 + rows * rh]]);
    for (let j = 0; j <= rows; j++) gridLines.push([[sx0, Y, sz0 + j * rh], [sx0 + cols * cw, Y, sz0 + j * rh]]);
    const sheet = segments(gridLines, c.rule);
    const under = stroke(
      [[sx0 - 5, 0.2, sz0 + 5], [sx0 + cols * cw - 5, 0.2, sz0 + 5], [sx0 + cols * cw - 5, 0.2, sz0 + rows * rh + 5], [sx0 - 5, 0.2, sz0 + rows * rh + 5], [sx0 - 5, 0.2, sz0 + 5]],
      c.rule,
    );
    const cells: [number, number][] = [[0, 0], [1, 0], [3, 0], [0, 1], [2, 1], [4, 1], [1, 2], [3, 2], [0, 3], [2, 3], [4, 3]];
    const data = segments(
      cells.map(([i, j]) => [[sx0 + i * cw + 2, 0.6, sz0 + j * rh + 6], [sx0 + i * cw + 7, 0.6, sz0 + j * rh + 6]] as [Vec, Vec]),
      c.ink,
    );

    // The tool: a standing panel.
    const PW = 66, PH = 54, px = 32, pz = -8, Z = pz + 1.1, L = px - PW / 2;
    const dash = panel(PW, PH, [px, 0, pz], c);
    const header = stroke([[L, PH - 14, Z], [L + PW, PH - 14, Z]], c.ink);
    const dots = [L + 6, L + 11].map((x) => dot(1.2, c.ink, [x, PH - 7, Z]));
    const side = stroke([[L + 14, PH - 14, Z], [L + 14, 0, Z]], c.ink);
    const navItems = segments([34, 28, 22].map((y) => [[L + 4, y, Z], [L + 10, y, Z]] as [Vec, Vec]), c.rule);
    const cx0 = L + 18;
    const kpis = [0, 15.5, 31].map((dx) =>
      stroke([[cx0 + dx, 29, Z], [cx0 + dx + 13, 29, Z], [cx0 + dx + 13, 37, Z], [cx0 + dx, 37, Z], [cx0 + dx, 29, Z]], c.rule),
    );
    const kpiLines = segments([0, 15.5, 31].map((dx) => [[cx0 + dx + 2.5, 33, Z], [cx0 + dx + 8, 33, Z]] as [Vec, Vec]), c.ink);
    // Two raised tiles: bars on one, the sparkline on the other.
    const TZ = Z + 1, TF = Z + 2.3;
    const chart = box(24, 2, 20, [cx0 + 12, 5, TZ], c.ink);
    const chartFill = solid(new THREE.BoxGeometry(24, 20, 2), c.ground);
    chartFill.position.set(cx0 + 12, 15, TZ);
    const bars = [[4, 10], [9, 14], [14, 7], [19, 16]].map(([bx, h]) => {
      const b = stroke([[0, 0, 0], [0, h, 0]], c.ink);
      b.position.set(cx0 + bx, 8, TF);
      return b;
    });
    const trend = box(18, 2, 20, [cx0 + 35, 5, TZ], c.ink);
    const trendFill = solid(new THREE.BoxGeometry(18, 20, 2), c.ground);
    trendFill.position.set(cx0 + 35, 15, TZ);
    const sparkPts: Vec[] = [[cx0 + 28, 10, TF], [cx0 + 31.5, 14, TF], [cx0 + 35, 12, TF], [cx0 + 38.5, 19, TF], [cx0 + 42, 16, TF]];
    const spark = stroke(sparkPts, c.ink);
    const tip = dot(1.6, c.accent, [cx0 + 42, 16, TF + 0.8]);

    // The pipe from the sheet to the tool, and the rows that travel it.
    const pipePts: Vec[] = [[sx0 + cols * cw, Y, 18], [L - 3, Y, 18], [L - 3, Y, pz + 2]];
    const pipe = stroke(pipePts, c.rule, { dashed: true, width: 1.2 });
    const packets = [0, 1, 2].map(() => {
      const d = dot(1.6, c.accent, [0, 0, 0]);
      (d.material as THREE.MeshBasicMaterial).opacity = 0;
      return d;
    });
    const ground = floor(c.dot, 0);
    [dash.fill, chartFill, trendFill, under, sheet, data, dash.edges, header, ...dots, side, navItems, ...kpis, kpiLines, chart, ...bars, trend, spark, tip, pipe, ...packets, ground].forEach((o) => group.add(o));
    group.position.y = -PH / 2;

    const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.7, repeatRefresh: true });
    packets.forEach((pk, i) => travel(loop, pk, pipePts.map(([x, , z]) => [x, 2, z] as Vec), i * 0.22, 1.0, "power1.in"));
    loop.to(bars.map((b) => b.scale), { y: () => gsap.utils.random(0.35, 1.1, 0.05), duration: 0.5, stagger: 0.05 }, 1.25)
      .fromTo(tip.material, { opacity: 0.25 }, { opacity: 1, duration: 0.3 }, 1.4);
    blink(loop, kpiLines.material as LineMaterial, 1.3, c.accent, c.ink, 0.3);

    return {
      group,
      shot: { az: 24, el: 20, fov: 30, frameH: 152, look: [16, 12, -4] },
      draw: [under, sheet, data, dash.edges, header, side, navItems, ...kpis, kpiLines, chart, ...bars, trend, spark],
      fade: [dash.fill, chartFill, trendFill, ...dots, tip, pipe, ground],
      labels: [
        { text: "rows 1,240", anchor: [sx0 - 5, 8, sz0 - 8] },
        { text: "live", anchor: [L + PW + 2, -6, pz + 10] },
      ],
      loop,
      update: (dt) => { (pipe.material as LineMaterial).dashOffset -= dt * 9; },
    };
  },

  /* If this, then that. A trigger, a decision standing on its point, the
     action it leads to, and a short branch to nothing. The job comes out of
     the trigger, goes into the diamond, and leaves it one way or the other:
     usually on to the action, which lights; sometimes down the other branch,
     where nothing happens. */
  automation(c) {
    const group = new THREE.Group();
    /* Laid out along the camera's screen axis, so it reads left to right at
       rest. u runs across the screen, v down it; both lie on the floor. */
    const P = (u: number, v: number, y = 0): Vec => [0.7071 * (u + v), y, 0.7071 * (v - u)];
    const Y = 0.4;

    // Trigger: a cube with the event on top.
    const trig = box(14, 14, 14, P(-72, 0), c.ink);
    const trigFill = solid(new THREE.BoxGeometry(14, 14, 14), c.ground);
    trigFill.position.set(...P(-72, 0, 7));
    const event = dot(2, c.accent, P(-72, 0, 14.8));

    // Decision: an octahedron standing on its point.
    const S = 9, DH = 11, [dx, , dz] = P(-14, 0), DC = DH + 0.5;
    const eq: Vec[] = [[dx + S, DC, dz], [dx, DC, dz + S], [dx - S, DC, dz], [dx, DC, dz - S]];
    const apexT: Vec = [dx, DC + DH, dz], apexB: Vec = [dx, DC - DH, dz];
    const diamond = segments(
      [
        [eq[0], eq[1]], [eq[1], eq[2]], [eq[2], eq[3]], [eq[3], eq[0]],
        [eq[0], apexT], [eq[1], apexT], [eq[2], apexT], [eq[3], apexT],
        [eq[0], apexB], [eq[1], apexB], [eq[2], apexB], [eq[3], apexB],
      ],
      c.ink,
    );
    const diamondFill = solid(new THREE.OctahedronGeometry(1), c.ground);
    diamondFill.scale.set(S, DH, S);
    diamondFill.position.set(dx, DC, dz);

    // Action: the system that does the thing.
    const [ax, , az] = P(58, 0);
    const action = box(22, 16, 30, [ax, 0, az], c.ink);
    const actionFill = solid(new THREE.BoxGeometry(22, 30, 16), c.ground);
    actionFill.position.set(ax, 15, az);
    const slot = stroke([[ax - 6, 22, az + 8.6], [ax + 6, 22, az + 8.6]], c.rule);

    // Else: a ring on the floor where nothing happens.
    const endAt = P(-14, 36, Y);
    const end = stroke(arc(4, 0, 0, 360, 32).map(([x, y, z]) => [x + endAt[0], y + Y, z + endAt[2]] as Vec), c.rule);

    const toDiamond = stroke([P(-64, 0, Y), P(-24, 0, Y)], c.rule, { dashed: true, width: 1.2 });
    const toAction = stroke([P(-4, 0, Y), P(46, 0, Y)], c.rule, { dashed: true, width: 1.2 });
    const toEnd = stroke([P(-14, 10, Y), P(-14, 31, Y)], c.rule, { dashed: true, width: 1.2 });

    const job = dot(2.4, c.accent, P(-64, 0, 2.5));
    (job.material as THREE.MeshBasicMaterial).opacity = 0;
    const ground = floor(c.dot, 0);
    [trigFill, diamondFill, actionFill, trig, diamond, action, slot, end, toDiamond, toAction, toEnd, event, job, ground].forEach((o) => group.add(o));
    group.position.y = -12;

    /* Two passes per cycle: the first goes on to the action, the second takes
       the other branch. */
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
    const pass = (at: number, yes: boolean) => {
      loop.to(event.material, { opacity: 0.3, duration: 0.15 }, at).to(event.material, { opacity: 1, duration: 0.4 }, at + 0.15);
      travel(loop, job, [P(-64, 0, 2.5), P(-22, 0, 2.5)], at + 0.1, 0.55, "power1.in");
      blink(loop, diamond.material as LineMaterial, at + 0.6, c.accent, c.ink, 0.3);
      if (yes) {
        travel(loop, job, [P(-6, 0, 2.5), P(46, 0, 2.5)], at + 1.05, 0.6, "power1.out");
        blink(loop, action.material as LineMaterial, at + 1.62, c.accent, c.ink, 0.35);
      } else {
        travel(loop, job, [P(-14, 9, 2.5), P(-14, 32, 2.5)], at + 1.05, 0.5, "power1.out");
        blink(loop, end.material as LineMaterial, at + 1.5, c.ink, c.rule, 0.3);
      }
    };
    pass(0, true);
    pass(3.6, false);

    return {
      group,
      /* Aimed a little left of the diamond so the trigger stays in frame
         when the flow grows out of a sheet that sits at the card's left. */
      shot: { az: 24, el: 20, fov: 30, frameH: 148, look: [-12, 6, 12] },
      draw: [trig, diamond, action, slot, end],
      fade: [trigFill, diamondFill, actionFill, toDiamond, toAction, toEnd, event, ground],
      labels: [
        { text: "if", anchor: [dx, DC + DH + 7, dz] },
        { text: "then", anchor: [ax, 36, az] },
        { text: "else", anchor: [endAt[0] + 8, 2, endAt[2] + 4] },
      ],
      loop,
      update: (dt) => {
        [toDiamond, toAction, toEnd].forEach((l) => ((l.material as LineMaterial).dashOffset -= dt * 9));
      },
    };
  },

  /* Three slabs stacked, a light on each, the live one pink, its check
     running up a dashed leader to the log line. */
  hosting(c, withLabels) {
    const group = new THREE.Group();
    const W = 76, D = 44, H = 12, GAP = 7;
    const slabs = [0, 1, 2].map((i) => box(W, D, H, [0, i * (H + GAP), 0], c.ink));
    const fills = [0, 1, 2].map((i) => {
      const m = solid(new THREE.BoxGeometry(W, H, D), c.ground);
      m.position.set(0, i * (H + GAP) + H / 2, 0);
      return m;
    });
    [...fills, ...slabs].forEach((s) => group.add(s));

    const lightAt = (i: number): Vec => [-W / 2 + 9, i * (H + GAP) + H / 2, D / 2 + 0.6];
    const lights = [0, 1].map((i) => dot(1.9, c.rule, lightAt(i)));
    const live = dot(2.1, c.accent, lightAt(2));
    [...lights, live].forEach((l) => group.add(l));

    /* The leader exists to point at the log line, so it goes with the labels. */
    const [lx, ly, lz] = lightAt(2);
    const leader = withLabels
      ? stroke([[lx, ly, lz], [lx - 22, ly, lz], [lx - 22, ly + 44, lz]], c.rule, { dashed: true, width: 1.2 })
      : null;
    if (leader) group.add(leader);

    const total = 3 * H + 2 * GAP;
    group.position.y = -total / 2;
    const ground = floor(c.dot, -1.5);
    group.add(ground);

    const loop = gsap.timeline({ repeat: -1, repeatDelay: 2.4 });
    loop.to(live.material, { opacity: 0.3, duration: 0.18 }, 0).to(live.material, { opacity: 1, duration: 0.4 }, 0.18);
    blink(loop, lights[1].material as THREE.MeshBasicMaterial, 0.45, c.accent, c.rule, 0.15);
    blink(loop, lights[0].material as THREE.MeshBasicMaterial, 0.75, c.accent, c.rule, 0.15);

    return {
      group,
      shot: { az: 24, el: 20, fov: 30, frameH: 150, look: [4, 8, 0] },
      draw: slabs,
      fade: [live, ...lights, ...fills, ...(leader ? [leader] : []), ground],
      labels: [
        { text: "03:14 200 ok", anchor: [lx - 22, ly + 50, lz], strong: true },
        { text: "x3", anchor: [W / 2 + 10, 0, D / 2 + 6] },
      ],
      loop,
      update: (dt) => { if (leader) (leader.material as LineMaterial).dashOffset -= dt * 9; },
    };
  },

  /* Three documents standing at different depths feed a core; one finished
     shape stands on the other side. */
  ai(c) {
    const group = new THREE.Group();
    const docs: { w: number; h: number; at: Vec; lines: number[] }[] = [
      { w: 16, h: 20, at: [-64, 0, 30], lines: [14, 10, 6] },
      { w: 20, h: 16, at: [-70, 0, 0], lines: [10, 6] },
      { w: 14, h: 22, at: [-64, 0, -30], lines: [16, 12, 8] },
    ];
    const docParts = docs.map((d) => {
      const p = panel(d.w, d.h, d.at, c, 1.5);
      (p.edges.material as LineMaterial).color.set(c.rule);
      const text = segments(
        d.lines.map((y, i) => [[d.at[0] - d.w / 2 + 3, y, d.at[2] + 0.9], [d.at[0] + d.w / 2 - 3 - (i % 2) * 3, y, d.at[2] + 0.9]] as [Vec, Vec]),
        c.rule,
      );
      return { ...p, text };
    });
    // Core: three orthogonal circles and a halo ring on the floor.
    const CY = 14, CR = 12;
    /* Built about the origin and lifted, so each can spin on its own axis. */
    const circleXY = stroke(arc(CR, 0, 0, 360, 48).map(([x, , z]) => [x, z, 0] as Vec), c.ink);
    const circleYZ = stroke(arc(CR, 0, 0, 360, 48).map(([x, , z]) => [0, z, x] as Vec), c.ink);
    const circleXZ = stroke(arc(CR, 0, 0, 360, 48), c.ink);
    const core = [circleXY, circleYZ, circleXZ];
    core.forEach((ci) => (ci.position.y = CY));
    const halo = stroke(arc(20, 0.4, 0, 360, 72), c.rule, { dashed: true, width: 1.2 });
    const centre = dot(3, c.accent, [0, CY, 0]);
    const result = panel(18, 24, [60, 0, 0], c, 1.5);
    const resultText = segments([[[54, 16, 1.0], [66, 16, 1.0]], [[54, 12, 1.0], [66, 12, 1.0]], [[54, 8, 1.0], [62, 8, 1.0]]], c.ink);
    const inPaths: Vec[][] = docs.map((d) => [[d.at[0] + d.w / 2 + 2, 0.4, d.at[2]], [-30, 0.4, d.at[2] * 0.5], [-20, 0.4, 0]]);
    const inLines = inPaths.map((pts) => stroke(pts, c.rule, { dashed: true, width: 1.2 }));
    const outPath: Vec[] = [[20, 0.4, 0], [50, 0.4, 0]];
    const outLine = stroke(outPath, c.rule, { dashed: true, width: 1.2 });
    const packets = [0, 1, 2].map(() => dot(2, c.accent, [0, 0, 0]));
    const out = dot(2, c.accent, [0, 0, 0]);
    [...packets, out].forEach((d) => ((d.material as THREE.MeshBasicMaterial).opacity = 0));
    const ground = floor(c.dot, 0);
    [...docParts.flatMap((d) => [d.fill]), result.fill, ...docParts.flatMap((d) => [d.edges, d.text]), circleXY, circleYZ, circleXZ, halo, centre, result.edges, resultText, ...inLines, outLine, ...packets, out, ground].forEach((o) => group.add(o));
    group.position.y = -CY;

    const FEED = 0.9;
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });
    packets.forEach((pk, i) => travel(loop, pk, inPaths[i].map(([x, y, z]) => [x, y + 2, z] as Vec), i * 0.16, FEED, "power2.in"));
    const ARRIVE = FEED + 0.32;
    [circleXY, circleYZ, circleXZ].forEach((ci) => blink(loop, ci.material as LineMaterial, ARRIVE - 0.1, c.accent, c.ink, 0.25));
    travel(loop, out, outPath.map(([x, y, z]) => [x, y + 2, z] as Vec), ARRIVE + 0.1, 0.6);
    blink(loop, result.edges.material as LineMaterial, ARRIVE + 0.62, c.accent, c.ink, 0.3);

    return {
      group,
      shot: { az: 20, el: 18, fov: 30, frameH: 130, look: [0, 10, 0] },
      draw: [...docParts.flatMap((d) => [d.edges, d.text]), circleXY, circleYZ, circleXZ, result.edges, resultText],
      fade: [...docParts.map((d) => d.fill), result.fill, halo, centre, ...inLines, outLine, ground],
      labels: [
        { text: "40 layouts", anchor: [-70, 30, 30] },
        { text: "1 schema", anchor: [60, -4, 16] },
      ],
      loop,
      update: (dt, t) => {
        [halo, ...inLines, outLine].forEach((l) => ((l.material as LineMaterial).dashOffset -= dt * 9));
        /* The core spins only while the camera is in, each ring on its own
           axis at its own rate, and winds down as the camera pulls out. */
        circleXY.rotation.y += dt * 2.6 * t;
        circleYZ.rotation.z += dt * 1.9 * t;
        circleXZ.rotation.x += dt * 2.2 * t;
      },
    };
  },

  /* The findings as slabs on the floor, ranked back to front by hours lost,
     against a ruler. The scan measures each out to its length. */
  audit(c) {
    const group = new THREE.Group();
    const X0 = -40, D = 10, H = 4;
    const lens = [80, 52, 28];
    const rows = lens.map((len, i) => {
      const g = new THREE.Group();
      const edges = box(len, D, H, [len / 2, 0, 0], i === 0 ? c.accent : c.ink);
      const fill = solid(new THREE.BoxGeometry(len, H, D), c.ground);
      fill.position.set(len / 2, H / 2, 0);
      g.add(fill, edges);
      g.position.set(X0, 0, 22 - i * 22);
      return { g, edges, fill, len };
    });
    const axisZ = -40;
    const axis = stroke([[X0, 0.3, axisZ], [X0 + 100, 0.3, axisZ]], c.rule);
    const ticks = segments([0, 20, 40, 60, 80, 100].map((x) => [[X0 + x, 0.3, axisZ], [X0 + x, 0.3, axisZ - 4]] as [Vec, Vec]), c.rule);
    const scan = stroke([[0, 0.3, 30], [0, 0.3, -32]], c.accent, { dashed: true, width: 1.2 });
    scan.position.x = X0;
    (scan.material as LineMaterial).opacity = 0;
    const ground = floor(c.dot, 0);
    [...rows.map((r) => r.g), axis, ticks, scan, ground].forEach((o) => group.add(o));
    group.position.y = -2;

    const SWEEP = 1.4, SPAN = 84;
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 2.4 });
    loop.to(rows.map((r) => r.g.scale), { x: 0.12, duration: 0.3, stagger: 0.04 }, 0)
      .fromTo(scan.material, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.4)
      .fromTo(scan.position, { x: X0 }, { x: X0 + SPAN, duration: SWEEP, ease: "none" }, 0.4)
      .to(scan.material, { opacity: 0, duration: 0.25 }, 0.4 + SWEEP - 0.05);
    rows.forEach((r) => loop.to(r.g.scale, { x: 1, duration: SWEEP * (r.len / SPAN), ease: "none" }, 0.4));

    return {
      group,
      shot: { az: 34, el: 26, fov: 30, frameH: 130, look: [10, 0, -6] },
      draw: [...rows.map((r) => r.edges), axis, ticks],
      fade: [...rows.map((r) => r.fill), ground],
      labels: [
        { text: "hours lost / week", anchor: [X0, 10, 44] },
        { text: "01", anchor: [X0 - 10, 2, 22] },
        { text: "02", anchor: [X0 - 10, 2, 0] },
        { text: "03", anchor: [X0 - 10, 2, -22] },
        { text: "4.2h", anchor: [X0 + 88, 2, 22], strong: true },
        { text: "1.5h", anchor: [X0 + 60, 2, 0] },
        { text: "0.5h", anchor: [X0 + 36, 2, -22] },
        { text: "0", anchor: [X0, 0, axisZ - 10] },
        { text: "5h", anchor: [X0 + 100, 0, axisZ - 10] },
      ],
      loop,
    };
  },
};

export const supported = new Set(Object.keys(builders));

/* ── Camera ──────────────────────────────────────────────────────────────── */

/** What the drawing's own box holds at rest, in world units. */
const FRAME_H = 120;
const REST = { az: 45, el: 35.264, fov: 4 };

/* ── Mount ───────────────────────────────────────────────────────────────── */

export function mount(fig: HTMLElement, slug: string) {
  const build = builders[slug];
  const sheet = fig.querySelector<HTMLElement>(".sheet");
  if (!build || !sheet) return false;

  /* The canvas is the card, not the sheet. The sheet stays in the layout as
     the place the object is framed at rest. */
  const card = fig.closest<HTMLElement>("a") ?? fig.parentElement ?? fig;
  if (getComputedStyle(card).position === "static") card.style.position = "relative";
  card.style.isolation = "isolate";
  card.classList.add("has-3d");

  const c = paletteOf(fig);
  const showLabels = fig.classList.contains("has-labels");
  const mark = build(c, showLabels);

  const canvas = document.createElement("canvas");
  canvas.className = "gl";
  card.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.add(mark.group);
  const camera = new THREE.PerspectiveCamera(REST.fov, 1, 1, 10000);

  /* Labels live in HTML over the canvas and follow their anchors. */
  const labels: Label[] = showLabels
    ? mark.labels.map((l) => {
        const el = document.createElement("span");
        el.className = "lbl3d" + (l.strong ? " lbl3d-strong" : "");
        el.textContent = l.text;
        card.appendChild(el);
        return { el, anchor: new THREE.Vector3(...l.anchor).add(mark.group.position), base: 0 };
      })
    : [];

  /* Card and sheet geometry, refreshed on resize. */
  let cw = 1, ch = 1, sx = 0, sy = 0, sw = 1, sh = 1;
  const fit = () => {
    const cr = card.getBoundingClientRect(), sr = sheet.getBoundingClientRect();
    cw = cr.width || 1; ch = cr.height || 1;
    sx = sr.left - cr.left; sy = sr.top - cr.top; sw = sr.width || 1; sh = sr.height || 1;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    const dpr = renderer.getPixelRatio();
    materials.forEach((m) => m.resolution.set(cw * dpr, ch * dpr));
  };
  const ro = new ResizeObserver(fit);
  ro.observe(card);
  ro.observe(sheet);
  fit();

  /* One number drives the camera: t is 0 at rest and 1 at the shot, and
     everything about the camera is a blend between the two. */
  const state = { t: 0 };
  const { shot } = mark;
  const lerp = THREE.MathUtils.lerp;
  const right = new THREE.Vector3(), up = new THREE.Vector3(), dir = new THREE.Vector3();
  const look = new THREE.Vector3(), target = new THREE.Vector3();
  const place = () => {
    const t = state.t;
    const az = THREE.MathUtils.degToRad(lerp(REST.az, shot.az, t));
    const el = THREE.MathUtils.degToRad(lerp(REST.el, shot.el, t));
    const fov = lerp(REST.fov, shot.fov, t);
    /* At rest the sheet shows FRAME_H, so the card shows FRAME_H scaled by
       their heights. At the shot the card shows the shot's frameH. */
    const frameH = lerp(FRAME_H * (ch / sh), shot.frameH, t);
    const dist = (frameH / 2) / Math.tan(THREE.MathUtils.degToRad(fov / 2));

    camera.fov = fov;
    camera.near = Math.max(1, dist - 500);
    camera.far = dist + 500;
    camera.updateProjectionMatrix();

    /* Orientation first, from the angles. */
    dir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    camera.position.copy(dir);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);

    /* The look point sits at the sheet's centre, not the card's: offset the
       target by the sheet's displacement from the card centre, in world
       units at this framing. So the object grows out from where it was. */
    const wpp = frameH / ch;
    look.set(lerp(0, shot.look[0], t), lerp(0, shot.look[1], t), lerp(0, shot.look[2], t));
    target
      .copy(look)
      .addScaledVector(right, -(sx + sw / 2 - cw / 2) * wpp)
      .addScaledVector(up, (sy + sh / 2 - ch / 2) * wpp);
    camera.position.copy(target).addScaledVector(dir, dist);
    camera.lookAt(target);
  };

  /* Labels belong to the schematic view: they follow their anchors, and fade
     out as the camera moves in so they never collide with the close shot. */
  const v = new THREE.Vector3();
  const placeLabels = () => {
    const fade = Math.max(0, 1 - state.t * 2.5);
    for (const l of labels) {
      v.copy(l.anchor).project(camera);
      l.el.style.transform = `translate(${((v.x + 1) / 2) * cw}px, ${((1 - v.y) / 2) * ch}px)`;
      l.el.style.opacity = String(fade * l.base);
    }
  };

  /* ── Entry and loop ──────────────────────────────────────────────────── */
  const entry = gsap.timeline();
  const ground = mark.group.getObjectByProperty("type", "Points") as THREE.Points | undefined;
  if (ground) entry.fromTo(ground.material as THREE.Material, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0);
  /* Richer marks have more strokes; the stagger shrinks so every entry
     lands in about the same time. */
  const step = Math.min(0.12, 1.1 / Math.max(1, mark.draw.length));
  mark.draw.forEach((s, i) => {
    const m = s.material as LineMaterial;
    const total = totalLength(s);
    /* Draw-on: one dash the length of the line, grown from nothing. */
    m.dashed = true;
    m.gapSize = total * 2;
    m.dashSize = 0;
    m.needsUpdate = true;
    entry.to(m, {
      dashSize: total,
      duration: 0.55,
      onComplete: () => {
        m.dashed = false;
        m.needsUpdate = true;
      },
    }, 0.15 + i * step);
  });
  const fadeMats = mark.fade.map((o) => o.material).filter((m) => m.type !== "PointsMaterial");
  entry.fromTo(fadeMats, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.05 }, ">-0.2");
  if (labels.length) entry.fromTo(labels, { base: 0 }, { base: 1, duration: 0.3, stagger: 0.05 }, "<0.1");

  const master = gsap.timeline({ paused: true });
  master.add(entry, 0.3).add(mark.loop, ">+=0.6");

  /* ── Hover: the camera move ──────────────────────────────────────────── */
  card.addEventListener("pointerenter", () => gsap.to(state, { t: 1, duration: 1.1, ease: "cf", overwrite: true }));
  card.addEventListener("pointerleave", () => gsap.to(state, { t: 0, duration: 0.9, ease: "cf", overwrite: true }));

  /* ── Frames ──────────────────────────────────────────────────────────── */
  let visible = false;
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!visible) return;
    mark.update?.(dt, state.t);
    place();
    placeLabels();
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        visible = e.isIntersecting;
        if (visible) master.play();
        else master.pause();
      }
    },
    { threshold: 0.2 },
  ).observe(fig);

  fig.classList.add("is-3d");
  return true;
}

function totalLength(s: Stroke): number {
  const pos = s.geometry.attributes.instanceStart
    ? (s.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute)
    : null;
  if (!pos) return 100;
  const end = s.geometry.attributes.instanceEnd as THREE.InterleavedBufferAttribute;
  let total = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(end, i);
    total += a.distanceTo(b);
  }
  return total;
}

/** Whether a WebGL context can be made here at all. */
export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
