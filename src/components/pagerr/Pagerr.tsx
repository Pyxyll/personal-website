import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BOOKS,
  BOOK_BY_ID,
  CAPTIONS,
  SECTIONS,
  SHELVES,
  SHELF_BY_ID,
  type Book,
  type SectionId,
} from "./data";
import { buildRoute, orderStops, roundedPath } from "./route";
import { buildShelfView } from "./shelfView";
import "./pagerr.css";

/**
 * Pagerr — an in-store book locator.
 *
 * Search a title or author and the shelf lights up on the floor plan, with a
 * walking route drawn from the checkout that stays in the aisles. Add several
 * books and it becomes a trip: the stops are ordered into a sensible walk and
 * numbered on the map. Clicking a shelf peeks inside it.
 */

interface Props {
  /** Store accent. The original shipped a theme switcher; these were the options. */
  accent?: string;
  /** Pulse the located shelf. */
  pulse?: boolean;
  /** Print shelf codes (1A, KB…) on the floor plan. */
  showShelfCodes?: boolean;
}

interface Tip {
  title: string;
  author: string;
  x: number;
  y: number;
}

/** Accent at a given alpha — the accent is a prop, so tints are derived not fixed. */
function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function Pagerr({
  accent = "#D97757",
  pulse = true,
  showShelfCodes = true,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [sectionFilter, setSectionFilter] = useState<SectionId | null>(null);
  const [shelfView, setShelfView] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [trip, setTrip] = useState<number[]>([]);

  const accentSoft = alpha(accent, 0.14);
  const glow = alpha(accent, 0.45);

  // ------------------------------------------------------------------ matching
  const q = query.trim().toLowerCase();
  const matches = q
    ? BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    : [];

  const selected = selectedId ? BOOK_BY_ID[selectedId] : null;
  const hovered = hoverId ? BOOK_BY_ID[hoverId] : null;

  // Hovering a result previews it without committing; otherwise fall back to the
  // selection, then to the top match, so the map is never blank while you type.
  const activeBook: Book | null =
    hovered ?? selected ?? (q && matches.length ? matches[0] : null);
  const activeShelfId = activeBook?.shelf ?? null;

  const toggleTrip = (id: number) =>
    setTrip((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const stopShelves = new Set(trip.map((id) => BOOK_BY_ID[id].shelf));

  // ---------------------------------------------------------------------- trip
  const orderedTrip = orderStops(trip, (id) => SHELF_BY_ID[BOOK_BY_ID[id].shelf]);

  // A trip beats a single lookup; with neither, there's no route to draw.
  const routeShelves = trip.length
    ? orderedTrip.map((id) => SHELF_BY_ID[BOOK_BY_ID[id].shelf])
    : activeBook
      ? [SHELF_BY_ID[activeBook.shelf]]
      : null;

  const routePts = routeShelves ? buildRoute(routeShelves) : null;
  const routePath = routePts ? roundedPath(routePts, 2.5) : "";
  const routeStart = routePts?.[0];
  const routeEnd = routePts?.[routePts.length - 1];

  // The <path> persists across route changes, so its draw animation wouldn't
  // restart. Alternating between two identical keyframe names forces a re-run.
  const routeKey = routeShelves ? routeShelves.map((s) => s.id).join(",") : "";
  const lastRouteKey = useRef<string | null>(null);
  const flip = useRef(false);
  if (routeKey !== lastRouteKey.current) {
    lastRouteKey.current = routeKey;
    flip.current = !flip.current;
  }
  const suffix = flip.current ? "a" : "b";
  const drawDur = 0.7 + 0.35 * (routeShelves?.length ?? 1);

  // Two stops on one shelf would stack their markers; nudge each subsequent one.
  const seen: Record<string, number> = {};
  const tripMarkers = orderedTrip.map((id, i) => {
    const s = SHELF_BY_ID[BOOK_BY_ID[id].shelf];
    const k = seen[s.id] ?? 0;
    seen[s.id] = k + 1;
    return { n: i + 1, x: s.x + s.w / 2 + k * 3.2, y: s.y + s.h / 2 };
  });

  // --------------------------------------------------------------- shelf view
  const sv = shelfView ? buildShelfView(shelfView, activeBook, accent) : null;
  const svShelf = shelfView ? SHELF_BY_ID[shelfView] : null;
  const svCaption =
    sv && sv.targetRow >= 0 && activeBook
      ? `${activeBook.title} — the highlighted spine, row ${sv.targetRow + 1} from the top.`
      : "Darker spines are catalogued titles — click one to select it.";

  // Escape backs out of the shelf view.
  useEffect(() => {
    if (!shelfView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShelfView(null);
        setTip(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shelfView]);

  // ------------------------------------------------------------------- status
  let located: string | null = null;
  if (activeBook) {
    const s = SHELF_BY_ID[activeBook.shelf];
    located = `${SECTIONS[s.sec]} · ${s.label}`;
  } else if (trip.length) {
    located = `${trip.length} ${trip.length === 1 ? "stop" : "stops"} from checkout`;
  } else if (sectionFilter) {
    located = SECTIONS[sectionFilter];
  }

  const rootStyle = {
    "--pgr-accent": accent,
    "--pgr-accent-soft": accentSoft,
    "--pgr-glow": glow,
  } as CSSProperties;

  return (
    <div className="pgr" style={rootStyle}>
      <header className="pgr-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="pgr-wordmark">
            pagerr<span style={{ color: accent }}>.</span>
          </div>
          <div className="pgr-tag">Demo</div>
        </div>
        <div className="pgr-stats">
          {BOOKS.length} titles · {Object.keys(SECTIONS).length} sections ·{" "}
          {SHELVES.length} shelves
        </div>
      </header>

      <main className="pgr-main">
        {/* ------------------------------------------------------- left panel */}
        <div className="pgr-panel">
          <div className="pgr-lede">
            <h1 className="pgr-h1">
              Where’s that <em>book</em>?
            </h1>
            <p className="pgr-sub">
              Start typing a title or author — the shelf lights up on the floor plan.
            </p>
          </div>

          <div className="pgr-search-wrap">
            <input
              className="pgr-search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId(null);
                // A hovered row can unmount without ever firing mouseleave, which
                // would strand hoverId on a book the cursor has long left.
                setHoverId(null);
              }}
              placeholder="Search by title or author…"
              aria-label="Search by title or author"
            />
            {q.length > 0 && (
              <button
                className="pgr-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSelectedId(null);
                  setHoverId(null);
                }}
              >
                ×
              </button>
            )}
          </div>

          {q.length === 0 && !selected && (
            <div className="pgr-hint">
              Try <b>Orwell</b>, <b>Beloved</b>, or <b>Sapiens</b>.
            </div>
          )}

          {q.length > 0 && matches.length === 0 && (
            <div className="pgr-empty">
              No titles match “{query}”. Try a different spelling or an author’s
              surname.
            </div>
          )}

          {matches.length > 0 && (
            <div className="pgr-results">
              {matches.slice(0, 9).map((b) => {
                const inTrip = trip.includes(b.id);
                return (
                  <button
                    key={b.id}
                    className="pgr-result"
                    style={{
                      background:
                        selected?.id === b.id ? "#F1EEE3" : "var(--pgr-surface)",
                    }}
                    onClick={() => setSelectedId(b.id)}
                    onMouseEnter={() => setHoverId(b.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="pgr-result-title">{b.title}</div>
                      <div className="pgr-result-author">{b.author}</div>
                    </div>
                    <div className="pgr-code">{b.shelf}</div>
                    <span
                      role="button"
                      tabIndex={0}
                      className="pgr-add"
                      title={inTrip ? "Remove from trip" : "Add to trip"}
                      aria-label={
                        inTrip
                          ? `Remove ${b.title} from trip`
                          : `Add ${b.title} to trip`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrip(b.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleTrip(b.id);
                        }
                      }}
                      style={{
                        background: inTrip ? accent : "transparent",
                        color: inTrip ? "var(--pgr-surface)" : accent,
                        border: `1.5px solid ${inTrip ? accent : "var(--pgr-line-3)"}`,
                      }}
                    >
                      {inTrip ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selected && (
            <div className="pgr-card" style={{ padding: 20 }}>
              <div className="pgr-eyebrow" style={{ marginBottom: 8 }}>
                Selected title
              </div>
              <div className="pgr-sel-title">{selected.title}</div>
              <div className="pgr-sel-author">{selected.author}</div>
              <div className="pgr-pills">
                <div className="pgr-pill">
                  {SECTIONS[SHELF_BY_ID[selected.shelf].sec]}
                </div>
                <div className="pgr-pill-shelf">
                  {SHELF_BY_ID[selected.shelf].label}
                </div>
                <div className="pgr-pill">In stock: {selected.stock}</div>
                <button
                  className="pgr-pill-add"
                  onClick={() => toggleTrip(selected.id)}
                >
                  {trip.includes(selected.id) ? "✓ In trip" : "+ Add to trip"}
                </button>
              </div>
            </div>
          )}

          {trip.length > 0 && (
            <div className="pgr-card" style={{ padding: "18px 18px 14px" }}>
              <div className="pgr-trip-head">
                <div className="pgr-eyebrow" style={{ flex: 1 }}>
                  Trip plan
                </div>
                <button className="pgr-trip-clear" onClick={() => setTrip([])}>
                  Clear
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {orderedTrip.map((id, i) => {
                  const b = BOOK_BY_ID[id];
                  return (
                    <div key={id} className="pgr-stop">
                      <div className="pgr-stop-n">{i + 1}</div>
                      <div className="pgr-stop-title">{b.title}</div>
                      <div className="pgr-stop-code">{b.shelf}</div>
                      <button
                        className="pgr-stop-remove"
                        aria-label={`Remove ${b.title} from trip`}
                        onClick={() => toggleTrip(id)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="pgr-trip-summary">
                {trip.length} {trip.length === 1 ? "stop" : "stops"} · optimised
                walking order from checkout
              </div>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------- floor plan */}
        <div className="pgr-stage">
          <div className="pgr-map">
            {located && (
              <div className="pgr-located">
                <div className="pgr-located-dot" />
                <div className="pgr-located-text">{located}</div>
              </div>
            )}

            {routeStart && (
              <svg
                className="pgr-route"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  {/* The dashes march forever, so the reveal is a mask that wipes
                      along the path rather than an offset on the dashes themselves. */}
                  <mask id="pgr-reveal">
                    <path
                      d={routePath}
                      pathLength={100}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray={100}
                      style={{
                        animation: `pgr-draw-${suffix} ${drawDur.toFixed(2)}s ease-out forwards`,
                      }}
                    />
                  </mask>
                </defs>
                <path
                  d={routePath}
                  fill="none"
                  stroke={accent}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  mask="url(#pgr-reveal)"
                  style={{ animation: "pgr-march 0.8s linear infinite" }}
                />
                <circle cx={routeStart[0]} cy={routeStart[1]} r={0.9} fill={accent} />
                {routeEnd && (
                  <circle
                    cx={routeEnd[0]}
                    cy={routeEnd[1]}
                    r={0.9}
                    fill={accent}
                    style={{
                      opacity: 0,
                      animation: `pgr-pop-${suffix} 0.35s ease-out ${(drawDur - 0.15).toFixed(2)}s forwards`,
                    }}
                  />
                )}
              </svg>
            )}

            {SHELVES.map((s) => {
              const isTarget = s.id === activeShelfId;
              const isStop = stopShelves.has(s.id);
              const inSection = sectionFilter !== null && s.sec === sectionFilter;
              // Recede anything the shopper isn't being pointed at.
              const dimmed =
                !isTarget &&
                !isStop &&
                (!!activeShelfId ||
                  trip.length > 0 ||
                  (sectionFilter !== null && !inSection));

              const horiz = s.sec === "ref" || s.id === "NR";
              const tick = isTarget ? "rgba(255,255,255,0.28)" : "rgba(74,69,60,0.14)";
              const divider = isTarget
                ? "rgba(255,255,255,0.35)"
                : "rgba(74,69,60,0.22)";
              // Ticks run across the shelf's length; the divider splits it in two.
              const stripes = horiz
                ? `repeating-linear-gradient(90deg, ${tick} 0 1.5px, transparent 1.5px 6px), linear-gradient(0deg, transparent 46%, ${divider} 46% 54%, transparent 54%)`
                : `repeating-linear-gradient(0deg, ${tick} 0 1.5px, transparent 1.5px 6px), linear-gradient(90deg, transparent 46%, ${divider} 46% 54%, transparent 54%)`;

              return (
                <button
                  key={s.id}
                  className="pgr-shelf"
                  title="Peek inside this shelf"
                  aria-label={`${SECTIONS[s.sec]}, ${s.label}`}
                  onClick={() => setShelfView(s.id)}
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.w}%`,
                    height: `${s.h}%`,
                    background: isTarget
                      ? accent
                      : isStop
                        ? alpha(accent, 0.3)
                        : inSection
                          ? alpha(accent, 0.22)
                          : "#DFDACA",
                    border: `1.5px solid ${
                      isTarget
                        ? accent
                        : isStop
                          ? alpha(accent, 0.7)
                          : inSection
                            ? alpha(accent, 0.55)
                            : "#CBC5B2"
                    }`,
                    transform: isTarget ? "scale(1.08)" : "scale(1)",
                    opacity: dimmed ? 0.55 : 1,
                    zIndex: isTarget ? 20 : 5,
                    animation:
                      isTarget && pulse ? "pgr-pulse 1.6s ease-out infinite" : "none",
                  }}
                >
                  <div className="pgr-shelf-stripes" style={{ background: stripes }} />
                  {showShelfCodes && (
                    <span
                      className="pgr-shelf-code"
                      style={{
                        color: isTarget ? "var(--pgr-surface)" : "#83807A",
                        background: isTarget
                          ? "rgba(0,0,0,0.18)"
                          : "rgba(250,249,245,0.75)",
                      }}
                    >
                      {s.id}
                    </span>
                  )}
                </button>
              );
            })}

            {tripMarkers.map((m) => (
              <div
                key={m.n}
                className="pgr-marker"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                {m.n}
              </div>
            ))}

            {sv && svShelf && (
              <div className="pgr-shelfview">
                <div className="pgr-sv-head">
                  <div style={{ flex: 1 }}>
                    <div className="pgr-eyebrow">Shelf view</div>
                    <div className="pgr-sv-title">
                      {SECTIONS[svShelf.sec]} · {svShelf.label}
                    </div>
                  </div>
                  <button
                    className="pgr-sv-back"
                    onClick={() => {
                      setShelfView(null);
                      setTip(null);
                    }}
                  >
                    ← Back to map
                  </button>
                </div>

                <div className="pgr-sv-case">
                  {sv.rows.map((row, ri) => (
                    <div key={ri} className="pgr-sv-row">
                      {row.map((sp, si) => {
                        const b = sp.book;
                        return (
                          <button
                            key={si}
                            className="pgr-spine"
                            disabled={!b}
                            aria-label={b ? `${b.title} by ${b.author}` : undefined}
                            style={{
                              flex: `${sp.flex} 1 0`,
                              height: sp.height,
                              background: sp.bg,
                              cursor: b ? "pointer" : "default",
                              animation:
                                b && activeBook?.id === b.id
                                  ? "pgr-pulse 1.6s ease-out infinite"
                                  : "none",
                            }}
                            onClick={b ? () => setSelectedId(b.id) : undefined}
                            onMouseMove={
                              b
                                ? (e) =>
                                    setTip({
                                      title: b.title,
                                      author: b.author,
                                      x: e.clientX,
                                      y: e.clientY,
                                    })
                                : undefined
                            }
                            onMouseLeave={b ? () => setTip(null) : undefined}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="pgr-sv-caption">{svCaption}</div>
              </div>
            )}

            {CAPTIONS.map((c) => (
              <div
                key={c.name}
                className="pgr-caption"
                style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%` }}
              >
                {c.name}
              </div>
            ))}

            <div className="pgr-entrance">
              <span>Entrance</span>
            </div>
            <div className="pgr-checkout">
              <span>Checkout</span>
            </div>
          </div>

          <div className="pgr-legend">
            <div className="pgr-legend-label">Sections</div>
            {(Object.keys(SECTIONS) as SectionId[]).map((id) => {
              const active = sectionFilter === id;
              return (
                <button
                  key={id}
                  className="pgr-legend-chip"
                  aria-pressed={active}
                  onClick={() => setSectionFilter(active ? null : id)}
                  style={{
                    background: active ? accent : "var(--pgr-surface)",
                    color: active ? "var(--pgr-surface)" : "var(--pgr-muted)",
                    border: `1.5px solid ${active ? accent : "var(--pgr-line-3)"}`,
                  }}
                >
                  {SECTIONS[id]}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {tip && (
        <div className="pgr-tip" style={{ left: tip.x, top: tip.y }}>
          <div className="pgr-tip-title">{tip.title}</div>
          <div className="pgr-tip-author">{tip.author}</div>
        </div>
      )}

      <footer className="pgr-footer">
        Portfolio demo with seeded data — a rebuilt showcase of client work. The
        production version also integrated barcode scanning and store hardware.
      </footer>
    </div>
  );
}
