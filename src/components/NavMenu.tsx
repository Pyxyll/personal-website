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
 * Hover is colour and nothing more, in the bar and in the panels: a link
 * brightens, a cell takes the page's second ground and shows its arrow. There
 * used to be a highlight that slid between the links and a pink glow that
 * chased the pointer across the cards; both were effects the rest of the site
 * has no equivalent of, and only one of the two panels had the glow.
 *
 * Triggers are real anchors via `asChild`. Hovering opens the panel, clicking
 * still navigates, and with JavaScript off they are ordinary links rather than
 * dead buttons.
 */
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

export default function NavMenu({ skills, work, pathname }: Props) {
  const active = (href: string) => (pathname.startsWith(href) ? " is-active" : "");

  return (
    <NavigationMenu.Root className="nav-menu" delayDuration={80} skipDelayDuration={300}>
      <NavigationMenu.List className="nav-menu-list">
        <NavigationMenu.Item value="skills">
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

        <NavigationMenu.Item value="work">
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

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={pathname.startsWith("/contact/")}>
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
