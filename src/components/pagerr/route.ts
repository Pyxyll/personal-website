import type { Shelf } from "./data";

/**
 * Route geometry for the floor plan.
 *
 * A shopper can't walk through a bookcase, so the route is not a straight line
 * between shelves — it's an orthogonal path that stays in the aisles. The floor
 * plan has four horizontal corridors and four vertical ones; every leg of a
 * route joins its endpoints via whichever corridor is cheapest.
 *
 * All coordinates are percentages of the floor-plan box (0–100 on both axes),
 * matching the shelf geometry in `data.ts`.
 */

export type Pt = [number, number];

/** A point in a corridor, plus whether that corridor runs horizontally. */
export interface Access {
  pt: { x: number; y: number; onH: boolean };
  /** The step off the corridor and into the shelf itself. */
  tail: Pt[];
}

/** Horizontal corridors (y) and vertical corridors (x). */
const H = [16.5, 38, 56, 80];
const C = [20.5, 38.5, 56.5, 74.5];

/** Where the shopper enters the store, in front of the checkout. */
export const START: Access["pt"] = { x: 14, y: 80, onH: true };
const START_PT: Pt = [14, 85];

/** The corridor point you'd stand at to reach a given shelf. */
export function accessFor(s: Shelf): Access {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;

  // The front table and the back wall are reached from the corridor running
  // alongside them; the children's corner is reached from its left-hand aisle.
  if (s.id === "NR") return { pt: { x: cx, y: 80, onH: true }, tail: [[cx, cy]] };
  if (s.sec === "ref") return { pt: { x: cx, y: 16.5, onH: true }, tail: [[cx, cy]] };
  if (s.sec === "kids") return { pt: { x: 74.5, y: cy, onH: false }, tail: [[cx, cy]] };

  // Aisle shelves are reached from the vertical corridor to their right.
  return { pt: { x: s.x + s.w + 3.5, y: cy, onH: false }, tail: [[cx, cy]] };
}

/** The corner points joining two corridor positions without crossing a shelf. */
export function pathBetween(a: Access["pt"], b: Access["pt"]): Pt[] {
  const pts: Pt[] = [[a.x, a.y]];

  const cheapest = (options: number[], from: number, to: number) =>
    options.reduce(
      (best, o) =>
        Math.abs(from - o) + Math.abs(to - o) <
        Math.abs(from - best) + Math.abs(to - best)
          ? o
          : best,
      options[0]
    );

  if (a.onH && b.onH) {
    // Both in horizontal corridors: hop across on the nearest vertical one.
    if (a.y !== b.y) {
      const corr = cheapest(C, a.x, b.x);
      pts.push([corr, a.y], [corr, b.y]);
    }
    pts.push([b.x, b.y]);
  } else if (a.onH) {
    pts.push([b.x, a.y], [b.x, b.y]);
  } else if (b.onH) {
    pts.push([a.x, b.y], [b.x, b.y]);
  } else {
    // Both in vertical corridors: cross on the nearest horizontal one.
    if (a.x !== b.x) {
      const hy = cheapest(H, a.y, b.y);
      pts.push([a.x, hy], [b.x, hy]);
    }
    pts.push([b.x, b.y]);
  }

  return pts;
}

/** Walking distance along an orthogonal path — Manhattan, since it's all corners. */
export function pathLength(pts: Pt[]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
  }
  return total;
}

/** Full walk from the checkout through every shelf in order, and back out to the
 *  corridor after each stop. */
export function buildRoute(shelves: Shelf[]): Pt[] {
  let pts: Pt[] = [START_PT];
  let cur = START;

  shelves.forEach((s, i) => {
    const acc = accessFor(s);
    pts = pts.concat(pathBetween(cur, acc.pt)).concat(acc.tail);
    // Step back out of the shelf to the corridor before heading to the next one.
    if (i < shelves.length - 1) pts.push([acc.pt.x, acc.pt.y]);
    cur = acc.pt;
  });

  // Collapse any duplicate consecutive points, which would break the corner maths.
  return pts.filter(
    (p, i, all) => i === 0 || p[0] !== all[i - 1][0] || p[1] !== all[i - 1][1]
  );
}

/**
 * Order the stops by repeatedly walking to whichever is nearest — a greedy
 * nearest-neighbour tour. Not optimal in general, but for a handful of stops in
 * a grid of aisles it produces the order a person would actually take, and it's
 * instant.
 */
export function orderStops<T>(
  items: T[],
  shelfOf: (item: T) => Shelf
): T[] {
  if (items.length < 2) return items;

  const remaining = items.slice();
  const ordered: T[] = [];
  let cur = START;

  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;

    remaining.forEach((item, i) => {
      const acc = accessFor(shelfOf(item));
      const d = pathLength(pathBetween(cur, acc.pt));
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });

    const [next] = remaining.splice(bestIdx, 1);
    ordered.push(next);
    cur = accessFor(shelfOf(next)).pt;
  }

  return ordered;
}

/** An SVG path through the points, with corners rounded by up to `r`. */
export function roundedPath(pts: Pt[], r: number): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;

  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const a = pts[i - 1];
    const b = pts[i + 1];

    const d1 = Math.hypot(p[0] - a[0], p[1] - a[1]);
    const d2 = Math.hypot(b[0] - p[0], b[1] - p[1]);
    if (d1 === 0 || d2 === 0) continue;

    // Pull back from the corner by at most half of each adjoining leg, so short
    // legs can't produce a curve that overshoots the next point.
    const r1 = Math.min(r, d1 / 2);
    const r2 = Math.min(r, d2 / 2);

    const inX = p[0] - ((p[0] - a[0]) / d1) * r1;
    const inY = p[1] - ((p[1] - a[1]) / d1) * r1;
    const outX = p[0] + ((b[0] - p[0]) / d2) * r2;
    const outY = p[1] + ((b[1] - p[1]) / d2) * r2;

    d += ` L ${inX.toFixed(2)} ${inY.toFixed(2)} Q ${p[0]} ${p[1]} ${outX.toFixed(
      2
    )} ${outY.toFixed(2)}`;
  }

  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}
