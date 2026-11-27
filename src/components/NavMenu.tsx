/**
 * The desktop mega menu.
 *
 * Built on @radix-ui/react-navigation-menu, which is the primitive shadcn's
 * navigation-menu wraps. Taking the primitive directly rather than the shadcn
 * copy keeps the styling in this site's vocabulary instead of shadcn's
 * defaults, and avoids pulling in cva/tailwind-merge for one component.
 *
 * Radix gives us the part that matters here: a shared viewport that measures
 * each panel and animates its own box between them, so moving from Skills to
 * Work morphs one surface rather than swapping two.
 *
 * Both panels are the same panel. A lead column says what the section is and
 * links to all of it; beside that, six cells, each a title and a line. Skills
 * and Work differ only in what they are handed, so opening one after the
 * other changes the words and nothing else.
 *
 * Hovering the bar slides one rounded highlight between Skills, Work and
 * Contact, rather than lighting a background on each. Radix's own Indicator
 * only follows the open item, so it would skip Contact, which has no panel;
 * this tracks pointer and focus across all three, and stays on the open
 * trigger while the pointer is down in its panel. Inside the panels, hover is
 * colour: a cell takes the page's second ground and shows its arrow.
 *
 * Triggers are real anchors via `asChild`. Hovering opens the panel, clicking
 * still navigates, and with JavaScript off they are ordinary links rather than
 * dead buttons.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

export interface MenuItem {
  href: string;
  title: string;
  description: string;
}

export interface MenuPanel {
  /** The section's name, at the head of the lead column. */
  heading: string;
  /** One sentence on what is in it. */
  blurb: string;
  /** The way to all of it. */
  all: { href: string; label: string };
  /** The cells. Six fills the grid; an odd number leaves a blank cell. */
  items: MenuItem[];
}

interface Props {
  skills: MenuPanel;
  work: MenuPanel;
  pathname: string;
}

/** Up-and-down chevrons: these open a menu rather than only going somewhere. */
function Chevron() {
  return (
    <svg
      className="nav-chevron"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5.8335 12.5002L10.0002 16.6668L14.1668 12.5002M5.8335 7.50016L10.0002 3.3335L14.1668 7.50016"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The site's arrow (components/ArrowIcon.astro), for use inside the island. */
function Arrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function Panel({ panel }: { panel: MenuPanel }) {
  return (
    <div className="nav-panel-inner">
      <div className="nav-lead">
        <p className="nav-lead-title">{panel.heading}</p>
        <p className="nav-lead-blurb">{panel.blurb}</p>
        <NavigationMenu.Link asChild>
          <a href={panel.all.href} className="nav-lead-action">
            {panel.all.label}
            <Arrow />
          </a>
        </NavigationMenu.Link>
      </div>

      <ul className="nav-cells">
        {panel.items.map((item) => (
          <li key={item.href}>
            <NavigationMenu.Link asChild>
              <a href={item.href} className="nav-cell">
                <span className="nav-cell-title">
                  {item.title}
                  <Arrow className="nav-cell-arrow" />
                </span>
                <span className="nav-cell-desc">{item.description}</span>
              </a>
            </NavigationMenu.Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Key = "skills" | "work" | "contact";
interface Box {
  left: number;
  width: number;
  /** slide: travel from where it was. place: appear here, fading in.
   *  instant: appear here with no transition at all (the first placement). */
  mode: "slide" | "place" | "instant";
}

export default function NavMenu({ skills, work, pathname }: Props) {
  const isCurrent = (href: string) => pathname.startsWith(href);
  const active = (href: string) => (isCurrent(href) ? " is-active" : "");
  const currentKey: Key | null = isCurrent("/skills/")
    ? "skills"
    : isCurrent("/work/")
      ? "work"
      : isCurrent("/contact/")
        ? "contact"
        : null;

  // Controlled, so the highlight can stay on whichever panel is open after the
  // pointer has left the trigger and gone down into the panel.
  const [value, setValue] = useState("");
  const [hovered, setHovered] = useState<Key | null>(null);

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<Key, HTMLLIElement>());
  const setItemRef = (key: Key) => (el: HTMLLIElement | null) => {
    if (el) itemRefs.current.set(key, el);
    else itemRefs.current.delete(key);
  };

  // Hover wins, then the open panel, then the current page: on a page in the
  // bar, the highlight rests on its item and is how you can tell where you
  // are. Leave the bar and it slides home. Elsewhere it hides.
  const target: Key | null = hovered ?? ((value as Key) || null);
  const parked = target ?? currentKey;
  const visible = parked !== null;

  const [box, setBox] = useState<Box | null>(null);
  const wasVisible = useRef(false);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const el = parked ? itemRefs.current.get(parked) : null;
    if (el) {
      // Resting on the current page at load: instant, to take over from the
      // server-drawn box. Arriving by hover: fade in. Moving: slide.
      const mode =
        !placed.current && target === null ? "instant" : wasVisible.current ? "slide" : "place";
      setBox({ left: el.offsetLeft, width: el.offsetWidth, mode });
      placed.current = true;
    }
    wasVisible.current = visible;
  }, [parked, visible]);

  // Fonts settling can move the items under it; follow them without a slide.
  // Set up once, reading the current target through a ref. A ResizeObserver
  // reports once as soon as it starts observing, and that first report is
  // skipped: acting on it would turn every slide into a jump.
  const parkedRef = useRef(parked);
  parkedRef.current = parked;
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      const key = parkedRef.current;
      const el = key ? itemRefs.current.get(key) : null;
      if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth, mode: "instant" });
    });
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  const track = (key: Key) => ({
    ref: setItemRef(key),
    onPointerEnter: () => setHovered(key),
    onFocus: () => setHovered(key),
  });

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
        data-ready={box ? "" : undefined}
        onPointerLeave={() => setHovered(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(null);
        }}
      >
        <li
          className="nav-hover"
          aria-hidden="true"
          data-visible={visible ? "true" : "false"}
          data-mode={box?.mode ?? "instant"}
          style={box ? { transform: `translateX(${box.left}px)`, width: box.width } : undefined}
        />

        <NavigationMenu.Item value="skills" {...track("skills")}>
          <NavigationMenu.Trigger asChild>
            <a href="/skills/" className={`nav-trigger${active("/skills/")}`}>
              <span className="nav-trigger-label">Skills</span>
              <Chevron />
            </a>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-panel">
            <Panel panel={skills} />
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="work" {...track("work")}>
          <NavigationMenu.Trigger asChild>
            <a href="/work/" className={`nav-trigger${active("/work/")}`}>
              <span className="nav-trigger-label">Work</span>
              <Chevron />
            </a>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-panel">
            <Panel panel={work} />
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item {...track("contact")}>
          <NavigationMenu.Link asChild active={isCurrent("/contact/")}>
            <a href="/contact/" className={`nav-trigger${active("/contact/")}`}>
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
