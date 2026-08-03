/**
 * The desktop mega menu.
 *
 * Built on @radix-ui/react-navigation-menu, which is the primitive shadcn's
 * navigation-menu wraps. Taking the primitive directly rather than the shadcn
 * copy keeps the styling in this site's vocabulary instead of shadcn's
 * defaults, and avoids pulling in cva/tailwind-merge for one component.
 *
 * Radix gives us the part that matters here: a shared viewport that measures
 * each panel and animates its own box between them, so moving from Services to
 * Work morphs one surface rather than swapping two.
 *
 * Triggers are real anchors via `asChild`. Hovering opens the panel, clicking
 * still navigates, and with JavaScript off they are ordinary links rather than
 * dead buttons.
 *
 * The hover highlight is one element that slides between items rather than a
 * background on each. Radix's own Indicator only follows the *open* item, so it
 * would skip Contact, which has no panel; this tracks pointer and focus across
 * all three.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import ServiceIcon from "./ServiceIcon";
import type { AnimatedIconHandle } from "./icons/types";

export interface ServiceItem {
  slug: string;
  title: string;
  tagline: string;
  price: string;
}

export interface WorkItem {
  href: string;
  title: string;
  summary: string;
  category: string;
}

interface Props {
  services: ServiceItem[];
  workGroups: { category: string; items: WorkItem[] }[];
  pathname: string;
}

const isActive = (pathname: string, href: string, also: string[] = []) =>
  pathname.startsWith(href) || also.some((p) => pathname.startsWith(p));

function Chevron() {
  return (
    <svg
      className="nav-chevron"
      viewBox="0 0 10 6"
      width="10"
      height="6"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 1.25L5 5l4-3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A service in the panel.
 *
 * Owns its two icons — the small one and the oversized ghost behind the text —
 * and runs both off the card's own hover so the whole cell reacts as one
 * object. The glow is not here: it belongs to the grid, because it has to
 * reach across cards.
 */
function ServiceCard({
  service,
  cardRef,
}: {
  service: ServiceItem;
  cardRef: (el: HTMLAnchorElement | null) => void;
}) {
  const icon = useRef<AnimatedIconHandle>(null);
  const ghost = useRef<AnimatedIconHandle>(null);

  const start = () => {
    icon.current?.startAnimation();
    ghost.current?.startAnimation();
  };
  const stop = () => {
    icon.current?.stopAnimation();
    ghost.current?.stopAnimation();
  };

  return (
    <NavigationMenu.Link asChild>
      <a
        ref={cardRef}
        href={`/services/#${service.slug}`}
        className="nav-card"
        onPointerEnter={start}
        onPointerLeave={stop}
        onFocus={start}
        onBlur={stop}
      >
        {/* Wrappers carry the class and the aria-hidden: the icon components
            only forward size, color, strokeWidth and className. */}
        <span className="nav-card-ghost" aria-hidden="true">
          <ServiceIcon ref={ghost} slug={service.slug} size={104} strokeWidth={1.1} />
        </span>
        <span className="nav-card-icon" aria-hidden="true">
          <ServiceIcon ref={icon} slug={service.slug} />
        </span>
        <span className="nav-card-title">{service.title}</span>
        <span className="nav-card-desc">{service.tagline}</span>
        <span className="nav-card-meta">From {service.price}</span>
      </a>
    </NavigationMenu.Link>
  );
}

/**
 * The services grid, and the light source over it.
 *
 * One pointer position is written to every card as its own local coordinates,
 * so a card the cursor is nowhere near still gets a number — just one far
 * outside its box, which its gradients resolve to almost nothing. That is what
 * makes the light spill across the divider onto a neighbour's edge instead of
 * stopping dead at the card under the cursor. Four cards lit by one lamp,
 * rather than four cards each with a torch.
 *
 * The position is eased toward the pointer rather than snapped to it, so the
 * light trails slightly behind the cursor.
 *
 * Values go straight onto the nodes as custom properties. Doing this through
 * React state would re-render the tree on every mouse move.
 */
function ServiceGrid({ services }: { services: ServiceItem[] }) {
  const gridRef = useRef<HTMLUListElement>(null);
  const cards = useRef(new Map<string, HTMLAnchorElement>());
  const boxes = useRef<{ el: HTMLAnchorElement; left: number; top: number }[]>([]);
  const target = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const inside = useRef(false);
  const reduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const sync = () => (reduced.current = mq.matches);
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // Card positions are read once on entry rather than every frame: measuring
  // inside the loop would force layout on each tick.
  const measure = () => {
    boxes.current = [...cards.current.values()].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, left: r.left, top: r.top };
    });
  };

  const paint = () => {
    const { x, y } = eased.current;
    for (const { el, left, top } of boxes.current) {
      el.style.setProperty("--glow-x", `${x - left}px`);
      el.style.setProperty("--glow-y", `${y - top}px`);
    }
  };

  const tick = () => {
    const e = eased.current;
    const t = target.current;
    e.x += (t.x - e.x) * 0.14;
    e.y += (t.y - e.y) * 0.14;
    paint();
    const settled = Math.abs(t.x - e.x) < 0.4 && Math.abs(t.y - e.y) < 0.4;
    raf.current = inside.current || !settled ? requestAnimationFrame(tick) : 0;
  };

  const enter = (e: React.PointerEvent<HTMLUListElement>) => {
    inside.current = true;
    measure();
    target.current = { x: e.clientX, y: e.clientY };
    eased.current = { ...target.current };
    gridRef.current?.setAttribute("data-glow", "on");
    if (reduced.current) {
      // Light still lands, it just does not chase the cursor.
      paint();
      return;
    }
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  const move = (e: React.PointerEvent<HTMLUListElement>) => {
    target.current = { x: e.clientX, y: e.clientY };
    if (reduced.current) {
      eased.current = { ...target.current };
      paint();
      return;
    }
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  const leave = () => {
    inside.current = false;
    gridRef.current?.removeAttribute("data-glow");
  };

  return (
    <ul
      ref={gridRef}
      className="nav-grid"
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {services.map((s) => (
        <li key={s.slug}>
          <ServiceCard
            service={s}
            cardRef={(el) => {
              if (el) cards.current.set(s.slug, el);
              else cards.current.delete(s.slug);
            }}
          />
        </li>
      ))}
    </ul>
  );
}

interface Action {
  href: string;
  label: string;
  /** Marks the one action worth pulling out of the row. */
  accent?: boolean;
}

/**
 * The secondary zone: a rounded container under the main grid, holding the
 * things that are not the panel's top-level items. Kept as a list so more can
 * be added without touching the layout.
 */
function PanelSecondary({ label, actions }: { label: string; actions: Action[] }) {
  return (
    <div className="nav-secondary">
      <span className="nav-secondary-label">{label}</span>
      <ul className="nav-secondary-list">
        {actions.map((a) => (
          <li key={a.href}>
            <NavigationMenu.Link asChild>
              <a
                href={a.href}
                className={`nav-secondary-action${a.accent ? " is-accent" : ""}`}
              >
                {a.label} <span aria-hidden="true">→</span>
              </a>
            </NavigationMenu.Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NavMenu({ services, workGroups, pathname }: Props) {
  // Controlled so the sliding highlight can stay parked on whichever panel is
  // open, even once the pointer has moved off the trigger and into the panel.
  const [value, setValue] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const setItemRef = (key: string) => (el: HTMLLIElement | null) => {
    if (el) itemRefs.current.set(key, el);
    else itemRefs.current.delete(key);
  };

  const activeKey = isActive(pathname, "/services/", ["/start/"])
    ? "services"
    : isActive(pathname, "/work/")
      ? "work"
      : isActive(pathname, "/contact/")
        ? "contact"
        : null;

  // Hover wins, then the open panel. Falling back to the current page parks the
  // highlight somewhere sensible so the first hover slides in from a real
  // position rather than jumping from the left edge.
  const target = hovered ?? (value || null);
  const parked = target ?? activeKey;
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = parked ? itemRefs.current.get(parked) : null;
    if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
  }, [parked]);

  // Type settling and viewport changes both move the items under the highlight.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = parked ? itemRefs.current.get(parked) : null;
      if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [parked]);

  return (
    <NavigationMenu.Root
      className="nav-menu"
      value={value}
      onValueChange={setValue}
      delayDuration={80}
      skipDelayDuration={300}
    >
      <NavigationMenu.List
        ref={listRef}
        className="nav-menu-list"
        onPointerLeave={() => setHovered(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(null);
        }}
      >
        <span
          className="nav-pill"
          data-visible={target ? "true" : "false"}
          aria-hidden="true"
          style={
            box ? { transform: `translateX(${box.left}px)`, width: box.width } : undefined
          }
        />

        <NavigationMenu.Item
          value="services"
          ref={setItemRef("services")}
          onPointerEnter={() => setHovered("services")}
          onFocus={() => setHovered("services")}
        >
          <NavigationMenu.Trigger asChild>
            <a
              href="/services/"
              className={`nav-trigger${activeKey === "services" ? " is-active" : ""}`}
            >
              <span className="nav-trigger-label">Services</span>
              <Chevron />
            </a>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-panel">
            <div className="nav-panel-inner">
              <ServiceGrid services={services} />
              <PanelSecondary
                label="More"
                actions={[
                  { href: "/services/", label: "All services and pricing" },
                  { href: "/start/", label: "Start a project", accent: true },
                ]}
              />
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item
          value="work"
          ref={setItemRef("work")}
          onPointerEnter={() => setHovered("work")}
          onFocus={() => setHovered("work")}
        >
          <NavigationMenu.Trigger asChild>
            <a
              href="/work/"
              className={`nav-trigger${activeKey === "work" ? " is-active" : ""}`}
            >
              <span className="nav-trigger-label">Work</span>
              <Chevron />
            </a>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-panel">
            <div className="nav-panel-inner">
              <div className="nav-grid">
                {workGroups.map((group) => (
                  <section key={group.category} className="nav-group">
                    <h3 className="nav-group-title">{group.category}</h3>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <NavigationMenu.Link asChild>
                            <a href={item.href} className="nav-row">
                              <span className="nav-row-title">{item.title}</span>
                              <span className="nav-row-desc">{item.summary}</span>
                            </a>
                          </NavigationMenu.Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <PanelSecondary
                label="More"
                actions={[{ href: "/work/", label: "All work" }]}
              />
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item
          ref={setItemRef("contact")}
          onPointerEnter={() => setHovered("contact")}
          onFocus={() => setHovered("contact")}
        >
          <NavigationMenu.Link asChild active={activeKey === "contact"}>
            <a
              href="/contact/"
              className={`nav-trigger${activeKey === "contact" ? " is-active" : ""}`}
            >
              <span className="nav-trigger-label">Contact</span>
            </a>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <div className="nav-viewport-slot">
        <NavigationMenu.Viewport className="nav-viewport" />
      </div>
    </NavigationMenu.Root>
  );
}
