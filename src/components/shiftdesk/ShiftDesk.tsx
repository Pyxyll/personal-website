import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./shiftdesk.css";

/**
 * ShiftDesk — an interactive staff-scheduling demo for a fictional dental
 * practice. Seeded in-memory data, no backend: every claim/drop/assign is local
 * state, and "Reset" restores the starting rota.
 *
 * Three modes share one week of data:
 *   staff   — you are a named employee; claim open shifts, drop your own, mark days off
 *   manager — assign/unassign anyone, add open shifts, see coverage gaps
 *   stats   — read-only rollups derived from the same live state
 */

// ------------------------------------------------------------------ constants

interface Person {
  id: string;
  name: string;
  role: Role;
  color: string;
}

type Role = "Dental Nurse" | "Receptionist" | "Hygienist" | "Practice Manager";
type Mode = "staff" | "manager" | "stats";
type Slot = "morning" | "afternoon" | "evening";

interface Shift {
  id: string;
  week: number;
  day: number;
  role: Role;
  start: number;
  end: number;
  assignee: string | null;
  note: string | null;
}

interface Notification {
  user: string;
  text: string;
  when: string;
  read: boolean;
  dot: string;
}

interface LogEntry {
  text: string;
  dot: string;
  when: string;
}

interface HistoryEntry {
  text: string;
  when: string;
}

interface TimeOff {
  staffId: string;
  week: number;
  day: number;
}

const ACCENT = "oklch(0.5 0.09 195)";
const ACCENT_STRONG = "oklch(0.55 0.09 195)";
const OPEN = "oklch(0.55 0.14 45)";
const OPEN_LINE = "oklch(0.82 0.06 60)";
const HOURS_TARGET = 32;

/** Max hours on the "filled hours by role" bar scale. */
const ROLE_HOURS_SCALE = 60;

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ROLES: Role[] = ["Dental Nurse", "Receptionist", "Hygienist", "Practice Manager"];

const SLOTS: Record<Slot, [number, number]> = {
  morning: [8, 13],
  afternoon: [13, 18],
  evening: [17, 20.5],
};

const STAFF: Person[] = [
  { id: "priya", name: "Priya Nair", role: "Dental Nurse", color: "oklch(0.55 0.1 195)" },
  { id: "james", name: "James Okafor", role: "Dental Nurse", color: "oklch(0.55 0.1 260)" },
  { id: "sofia", name: "Sofia Reyes", role: "Receptionist", color: "oklch(0.55 0.1 330)" },
  { id: "hannah", name: "Hannah Clarke", role: "Hygienist", color: "oklch(0.55 0.1 140)" },
  { id: "tom", name: "Tom Whitfield", role: "Practice Manager", color: "oklch(0.55 0.1 60)" },
  { id: "aisha", name: "Aisha Begum", role: "Receptionist", color: "oklch(0.55 0.1 20)" },
];

const BY_ID: Record<string, Person> = Object.fromEntries(STAFF.map((p) => [p.id, p]));

const WEEKS = [
  { label: "Week of 6–11 July", dates: ["6 Jul", "7 Jul", "8 Jul", "9 Jul", "10 Jul", "11 Jul"] },
  { label: "Week of 13–18 July", dates: ["13 Jul", "14 Jul", "15 Jul", "16 Jul", "17 Jul", "18 Jul"] },
  { label: "Week of 20–25 July", dates: ["20 Jul", "21 Jul", "22 Jul", "23 Jul", "24 Jul", "25 Jul"] },
];

const LAST_WEEK = WEEKS.length - 1;

function seedShifts(): Shift[] {
  const S = (
    id: string,
    week: number,
    day: number,
    role: Role,
    start: number,
    end: number,
    assignee?: string,
    note?: string
  ): Shift => ({ id, week, day, role, start, end, assignee: assignee ?? null, note: note ?? null });

  return [
    S("p1", 0, 0, "Receptionist", 8, 13, "sofia"),
    S("p2", 0, 0, "Dental Nurse", 8, 13, "priya"),
    S("p3", 0, 1, "Dental Nurse", 13, 18, "james"),
    S("p4", 0, 2, "Hygienist", 8, 13, "hannah"),
    S("p5", 0, 3, "Receptionist", 13, 18, "aisha"),
    S("p6", 0, 4, "Practice Manager", 8, 16, "tom"),
    S("p7", 0, 5, "Dental Nurse", 9, 13, "james"),
    S("m1", 1, 0, "Receptionist", 8, 13, "sofia"),
    S("m2", 1, 0, "Dental Nurse", 8, 13, "james", "Surgery 1"),
    S("m3", 1, 0, "Dental Nurse", 13, 18, undefined, "Surgery 2"),
    S("m4", 1, 0, "Hygienist", 13, 18, "hannah"),
    S("t1", 1, 1, "Receptionist", 8, 13, "aisha"),
    S("t2", 1, 1, "Dental Nurse", 8, 13, "priya", "Surgery 1"),
    S("t3", 1, 1, "Receptionist", 13, 18, "sofia"),
    S("t4", 1, 1, "Dental Nurse", 13, 18),
    S("w1", 1, 2, "Receptionist", 8, 13, "sofia"),
    S("w2", 1, 2, "Dental Nurse", 8, 13, "james"),
    S("w3", 1, 2, "Hygienist", 13, 18, undefined, "Hygiene clinic"),
    S("w4", 1, 2, "Dental Nurse", 17, 20.5, "priya", "Late surgery"),
    S("th1", 1, 3, "Receptionist", 8, 13, "aisha"),
    S("th2", 1, 3, "Dental Nurse", 8, 13, "priya"),
    S("th3", 1, 3, "Dental Nurse", 13, 18, "james"),
    S("th4", 1, 3, "Receptionist", 17, 20.5, undefined, "Late surgery"),
    S("f1", 1, 4, "Receptionist", 8, 13, "sofia"),
    S("f2", 1, 4, "Hygienist", 8, 13, "hannah"),
    S("f3", 1, 4, "Dental Nurse", 13, 18),
    S("f4", 1, 4, "Practice Manager", 8, 16, "tom"),
    S("s1", 1, 5, "Receptionist", 9, 13),
    S("s2", 1, 5, "Dental Nurse", 9, 13, "james"),
    S("s3", 1, 5, "Hygienist", 9, 14, "hannah"),
    S("n1", 2, 0, "Receptionist", 8, 13, "sofia"),
    S("n2", 2, 0, "Dental Nurse", 8, 13, undefined, "Surgery 1"),
    S("n3", 2, 1, "Dental Nurse", 13, 18),
    S("n4", 2, 2, "Hygienist", 8, 13, "hannah"),
    S("n5", 2, 2, "Receptionist", 13, 18),
    S("n6", 2, 3, "Dental Nurse", 8, 13),
    S("n7", 2, 4, "Practice Manager", 8, 16, "tom"),
    S("n8", 2, 4, "Receptionist", 8, 13),
  ];
}

function seedNotifications(): Notification[] {
  return [
    {
      user: "priya",
      text: "Reminder: you hold the late surgery shift Wed 17:00–20:30.",
      when: "Yesterday",
      read: false,
      dot: ACCENT_STRONG,
    },
    {
      user: "priya",
      text: "The Saturday rota was published — 1 open shift needs cover.",
      when: "2 days ago",
      read: false,
      dot: OPEN,
    },
  ];
}

// -------------------------------------------------------------------- helpers

const fmtTime = (t: number) => {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${h}:${m < 10 ? "0" + m : m}`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const nowStr = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Total hours across a set of shifts, to one decimal place. */
const hrs = (list: Shift[]) =>
  Math.round(list.reduce((a, s) => a + (s.end - s.start), 0) * 10) / 10;

const overlaps = (a: Shift, b: Shift) =>
  a.week === b.week && a.day === b.day && a.start < b.end && b.start < a.end;

const shiftDesc = (s: Shift) =>
  `${DAY_NAMES[s.day]} ${fmtTime(s.start)}–${fmtTime(s.end)}`;

// ---------------------------------------------------------------------- state

interface State {
  mode: Mode;
  weekIdx: number;
  shifts: Shift[];
  roleFilter: Role | null;
  openOnly: boolean;
  pickerFor: string | null;
  currentUser: string;
  userMenuOpen: boolean;
  inboxOpen: boolean;
  notifications: Notification[];
  detailFor: string | null;
  history: Record<string, HistoryEntry[]>;
  timeOff: TimeOff[];
  addShiftDay: number | null;
  addRole: Role;
  addSlot: Slot;
  narrow: boolean;
  activeDay: number;
  /** Flipped on every mode change so the scene-entry animation re-triggers. */
  sceneEpoch: number;
  toast: string | null;
  toastKind: "ok" | "warn";
  /** Shift that most recently changed — drives the one-shot pulse highlight. */
  lastChanged: string | null;
  log: LogEntry[];
}

const initialState = (): State => ({
  mode: "staff",
  weekIdx: 1,
  shifts: seedShifts(),
  roleFilter: null,
  openOnly: false,
  pickerFor: null,
  currentUser: "priya",
  userMenuOpen: false,
  inboxOpen: false,
  notifications: seedNotifications(),
  detailFor: null,
  history: {},
  timeOff: [{ staffId: "james", week: 1, day: 4 }], // James is off on Friday
  addShiftDay: null,
  addRole: "Dental Nurse",
  addSlot: "morning",
  narrow: false,
  activeDay: 0,
  sceneEpoch: 0,
  toast: null,
  toastKind: "ok",
  lastChanged: null,
  log: [],
});

type Patch = Partial<State> | ((s: State) => Partial<State>);

/** Mirrors class-component `setState`: shallow-merge a patch, or a patch derived
 *  from the previous state. Keeps the ported action code close to the original. */
const merge = (s: State, patch: Patch): State => ({
  ...s,
  ...(typeof patch === "function" ? patch(s) : patch),
});

// ------------------------------------------------------------------ component

export default function ShiftDesk() {
  const [state, setState] = useReducer(merge, null, initialState);
  const toastTimer = useRef<number | undefined>(undefined);
  const shiftSeq = useRef(1);

  // FLIP: rects captured immediately before a state change that reorders cards.
  const rects = useRef<Record<string, DOMRect> | null>(null);

  const {
    mode,
    weekIdx,
    shifts,
    roleFilter,
    openOnly,
    pickerFor,
    currentUser,
    narrow,
    activeDay,
    detailFor,
    addShiftDay,
    timeOff,
    history,
    log,
    notifications,
  } = state;

  // ---- responsive: below 680px we show one day at a time behind day tabs
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 680px)");
    const onChange = () => setState({ narrow: mq.matches });
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const snapshotRects = useCallback(() => {
    const map: Record<string, DOMRect> = {};
    document.querySelectorAll<HTMLElement>("[data-shift-id]").forEach((el) => {
      map[el.dataset.shiftId!] = el.getBoundingClientRect();
    });
    rects.current = map;
  }, []);

  // FLIP: after a snapshotted change, play cards from where they used to be to
  // where they are now, and fade in any card that wasn't there before.
  useLayoutEffect(() => {
    const old = rects.current;
    if (!old) return;
    rects.current = null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let newIdx = 0;
    document.querySelectorAll<HTMLElement>("[data-shift-id]").forEach((el) => {
      const prev = old[el.dataset.shiftId!];
      const next = el.getBoundingClientRect();
      if (prev) {
        const dx = prev.left - next.left;
        const dy = prev.top - next.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
            { duration: 380, easing: "cubic-bezier(0.22, 0.9, 0.26, 1)" }
          );
        }
      } else {
        el.animate(
          [
            { opacity: 0, transform: "translateY(10px) scale(0.97)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 320,
            easing: "ease",
            delay: Math.min(newIdx * 40, 280),
            fill: "backwards",
          }
        );
        newIdx++;
      }
    });
  });

  // ---- toast / log / history / notify
  const showToast = useCallback((text: string, kind: "ok" | "warn" = "ok") => {
    window.clearTimeout(toastTimer.current);
    setState({ toast: text, toastKind: kind });
    toastTimer.current = window.setTimeout(() => setState({ toast: null }), 2800);
  }, []);

  const addLog = useCallback((text: string, dot: string) => {
    setState((s) => ({ log: [{ text, dot, when: nowStr() }, ...s.log].slice(0, 6) }));
  }, []);

  const addHistory = useCallback((shiftId: string, text: string) => {
    setState((s) => ({
      history: {
        ...s.history,
        [shiftId]: [{ text, when: `${nowStr()} today` }, ...(s.history[shiftId] ?? [])],
      },
    }));
  }, []);

  const notify = useCallback((userId: string, text: string, dot: string = ACCENT_STRONG) => {
    setState((s) => ({
      notifications: [
        { user: userId, text, when: "Just now", read: false, dot },
        ...s.notifications,
      ].slice(0, 10),
    }));
  }, []);

  // ---- availability + clash rules
  const isOff = useCallback(
    (personId: string, week: number, day: number) =>
      timeOff.some((t) => t.staffId === personId && t.week === week && t.day === day),
    [timeOff]
  );

  /** The shift this person already holds that would overlap `shift`, if any. */
  const conflictFor = useCallback(
    (personId: string, shift: Shift) =>
      shifts.find((x) => x.assignee === personId && x.id !== shift.id && overlaps(x, shift)),
    [shifts]
  );

  // ---- actions
  const claim = (shift: Shift) => {
    const me = BY_ID[currentUser];

    if (isOff(currentUser, shift.week, shift.day)) {
      showToast("You've marked this day as off", "warn");
      return;
    }
    const clash = conflictFor(currentUser, shift);
    if (clash) {
      showToast(
        `Clashes with your ${fmtTime(clash.start)}–${fmtTime(clash.end)} ${clash.role} shift`,
        "warn"
      );
      return;
    }

    snapshotRects();
    setState((s) => ({
      shifts: s.shifts.map((x) => (x.id === shift.id ? { ...x, assignee: currentUser } : x)),
      lastChanged: shift.id,
    }));
    showToast(`Shift claimed — ${shift.role}, ${fmtTime(shift.start)}–${fmtTime(shift.end)}`);
    addLog(`${me.name} claimed ${shiftDesc(shift)} (${shift.role})`, ACCENT_STRONG);
    addHistory(shift.id, `Claimed by ${me.name}`);
  };

  const drop = (shift: Shift) => {
    const me = BY_ID[currentUser];
    snapshotRects();
    setState((s) => ({
      shifts: s.shifts.map((x) => (x.id === shift.id ? { ...x, assignee: null } : x)),
      lastChanged: shift.id,
    }));
    showToast("Shift returned to open");
    addLog(`${me.name} dropped ${shiftDesc(shift)} (${shift.role})`, OPEN);
    addHistory(shift.id, `Dropped by ${me.name} — returned to open`);
  };

  const assign = (shift: Shift, personId: string) => {
    const person = BY_ID[personId];
    snapshotRects();
    setState((s) => ({
      shifts: s.shifts.map((x) => (x.id === shift.id ? { ...x, assignee: personId } : x)),
      lastChanged: shift.id,
      pickerFor: null,
    }));
    showToast(`Assigned to ${person.name}`);
    addLog(`${person.name} assigned to ${shiftDesc(shift)} (${shift.role})`, ACCENT_STRONG);
    addHistory(shift.id, `Assigned to ${person.name} by manager`);
    notify(personId, `You were assigned ${shiftDesc(shift)} (${shift.role}).`);
  };

  const unassign = (shift: Shift) => {
    const person = shift.assignee ? BY_ID[shift.assignee] : null;
    snapshotRects();
    setState((s) => ({
      shifts: s.shifts.map((x) => (x.id === shift.id ? { ...x, assignee: null } : x)),
      lastChanged: shift.id,
      pickerFor: null,
    }));
    showToast(`Unassigned ${person ? person.name : ""}`);
    addLog(`${person ? person.name : "Staff"} unassigned from ${shiftDesc(shift)}`, OPEN);
    addHistory(shift.id, `Unassigned from ${person ? person.name : "staff"} by manager`);
    if (person) {
      notify(
        person.id,
        `Your ${shiftDesc(shift)} shift (${shift.role}) was unassigned.`,
        OPEN
      );
    }
  };

  const addShift = (day: number) => {
    const [start, end] = SLOTS[state.addSlot];
    const id = `x${shiftSeq.current++}-${Date.now()}`;
    const shift: Shift = {
      id,
      week: weekIdx,
      day,
      role: state.addRole,
      start,
      end,
      assignee: null,
      note: null,
    };
    snapshotRects();
    setState((s) => ({ shifts: [...s.shifts, shift], addShiftDay: null, lastChanged: id }));
    showToast(`Open shift added — ${state.addRole}, ${DAY_NAMES[day]}`);
    addLog(`Manager added open ${state.addRole} shift, ${shiftDesc(shift)}`, ACCENT_STRONG);
    addHistory(id, "Created by manager");
  };

  const toggleOff = (day: number) => {
    const me = BY_ID[currentUser];
    const off = isOff(currentUser, weekIdx, day);

    if (off) {
      setState((s) => ({
        timeOff: s.timeOff.filter(
          (t) => !(t.staffId === currentUser && t.week === weekIdx && t.day === day)
        ),
      }));
      showToast(`${DAY_NAMES[day]} — available again`);
      return;
    }

    setState((s) => ({
      timeOff: [...s.timeOff, { staffId: currentUser, week: weekIdx, day }],
    }));
    // Marking a day off doesn't drop shifts you already hold — flag that.
    const held = shifts.filter(
      (x) => x.assignee === currentUser && x.week === weekIdx && x.day === day
    ).length;
    showToast(
      `Marked ${DAY_NAMES[day]} as off` +
        (held ? ` — you still hold ${held} shift${held > 1 ? "s" : ""} that day` : ""),
      held ? "warn" : "ok"
    );
    addLog(`${me.name} marked ${DAY_NAMES[day]} as unavailable`, OPEN);
  };

  const resetDemo = () => {
    setState({
      shifts: seedShifts(),
      weekIdx: 1,
      roleFilter: null,
      openOnly: false,
      pickerFor: null,
      currentUser: "priya",
      userMenuOpen: false,
      inboxOpen: false,
      notifications: seedNotifications(),
      detailFor: null,
      history: {},
      timeOff: [{ staffId: "james", week: 1, day: 4 }],
      addShiftDay: null,
      activeDay: 0,
      lastChanged: null,
      log: [],
    });
    showToast("Demo reset to starting state");
  };

  const closeMenus = () => setState({ userMenuOpen: false, inboxOpen: false });
  const closeDetail = useCallback(() => setState({ detailFor: null }), []);

  // Escape closes whatever is layered on top.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (detailFor) closeDetail();
      else setState({ userMenuOpen: false, inboxOpen: false, pickerFor: null });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detailFor, closeDetail]);

  // ------------------------------------------------------------- derived state

  const isStaff = mode === "staff";
  const isManager = mode === "manager";
  const isStats = mode === "stats";

  const me = BY_ID[currentUser];
  const week = WEEKS[weekIdx];
  const isPastWeek = weekIdx === 0;
  const weekShifts = shifts.filter((s) => s.week === weekIdx);

  const workload = (pid: string) =>
    weekShifts.filter((s) => s.assignee === pid).reduce((a, s) => a + (s.end - s.start), 0);

  const mine = weekShifts
    .filter((s) => s.assignee === currentUser)
    .sort((a, b) => a.day - b.day || a.start - b.start);

  const openCount = weekShifts.filter((s) => !s.assignee).length;
  const filledCount = weekShifts.length - openCount;

  const staffStats = STAFF.map((p) => {
    const ps = weekShifts.filter((s) => s.assignee === p.id);
    const h = hrs(ps);
    return {
      ...p,
      shiftCount: ps.length,
      hours: h,
      barWidth: `${Math.min(100, Math.round((h / HOURS_TARGET) * 100))}%`,
    };
  });

  const myNotifs = notifications.filter((n) => n.user === currentUser);
  const unread = myNotifs.filter((n) => !n.read).length;

  const sceneName = state.sceneEpoch % 2 === 0 ? "sd-sceneInA" : "sd-sceneInB";

  const detailShift = detailFor ? shifts.find((s) => s.id === detailFor) ?? null : null;

  const visibleDays = narrow ? [activeDay] : DAY_NAMES.map((_, i) => i);

  // ------------------------------------------------------------------- render

  const chip = (label: string, on: boolean, onClick: () => void, tone = ACCENT) => (
    <button
      key={label}
      onClick={onClick}
      className="sd-chip"
      aria-pressed={on}
      style={{
        background: on ? tone : "#ffffff",
        color: on ? "#ffffff" : "oklch(0.48 0.02 200)",
        border: `1px solid ${on ? tone : "oklch(0.9 0.01 180)"}`,
      }}
    >
      {label}
    </button>
  );

  const avatar = (person: Person | null, size: number, style?: CSSProperties): ReactNode => (
    <span
      className="sd-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: person ? person.color : "transparent",
        border: person ? "none" : `1.5px dashed ${OPEN}`,
        ...style,
      }}
    >
      {person ? initials(person.name) : ""}
    </span>
  );

  return (
    <div className="sd">
      {/* ------------------------------------------------------------ header */}
      <header className="sd-header">
        <div className="sd-brand">
          <div className="sd-logo">SD</div>
          <div>
            <div className="sd-brand-name">ShiftDesk</div>
            <div className="sd-brand-sub">Bramley Dental Practice · demo</div>
          </div>
        </div>

        <div className="sd-actions">
          {isStaff && (
            <>
              {/* View-as switcher */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setState((s) => ({ userMenuOpen: !s.userMenuOpen, inboxOpen: false }))
                  }
                  className="sd-userbtn"
                  aria-expanded={state.userMenuOpen}
                  aria-haspopup="menu"
                >
                  {avatar(me, 26)}
                  <span>{me.name}</span>
                  <span className="sd-caret" aria-hidden="true">
                    ▼
                  </span>
                </button>

                {state.userMenuOpen && (
                  <>
                    <div className="sd-scrim" onClick={closeMenus} />
                    <div className="sd-menu" role="menu">
                      <span className="sd-menu-label">View as…</span>
                      {STAFF.map((p) => (
                        <button
                          key={p.id}
                          role="menuitem"
                          className="sd-menu-item"
                          style={{
                            background:
                              p.id === currentUser ? "oklch(0.965 0.01 195)" : "transparent",
                          }}
                          onClick={() => {
                            setState({ currentUser: p.id, userMenuOpen: false });
                            showToast(`Now viewing as ${p.name}`);
                          }}
                        >
                          {avatar(p, 24)}
                          <span className="sd-menu-item-name">{p.name}</span>
                          <span className="sd-menu-item-role">{p.role}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Notifications */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setState((s) => ({
                      inboxOpen: !s.inboxOpen,
                      userMenuOpen: false,
                      // Opening the inbox marks this user's notifications read.
                      notifications: !s.inboxOpen
                        ? s.notifications.map((n) =>
                            n.user === currentUser ? { ...n, read: true } : n
                          )
                        : s.notifications,
                    }))
                  }
                  className="sd-bellbtn"
                  aria-label={
                    unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
                  }
                  aria-expanded={state.inboxOpen}
                >
                  <span
                    className="sd-bell"
                    style={{
                      animation: unread > 0 ? "sd-bellRing 2.4s ease-in-out 1s infinite" : "none",
                    }}
                    aria-hidden="true"
                  >
                    🔔
                  </span>
                  {unread > 0 && <span className="sd-badge">{unread}</span>}
                </button>

                {state.inboxOpen && (
                  <>
                    <div className="sd-scrim" onClick={closeMenus} />
                    <div className="sd-inbox">
                      <span className="sd-inbox-title">Notifications</span>
                      {myNotifs.length === 0 && (
                        <span className="sd-inbox-empty">
                          Nothing yet — you're all caught up.
                        </span>
                      )}
                      {myNotifs.map((n, i) => (
                        <div
                          key={i}
                          className="sd-notif"
                          style={{ background: n.read ? "transparent" : "oklch(0.975 0.01 195)" }}
                        >
                          <span
                            className="sd-dot"
                            style={{ width: 7, height: 7, background: n.dot, marginTop: 5 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="sd-notif-text">{n.text}</div>
                            <div className="sd-notif-when">{n.when}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Mode toggle */}
          <div className="sd-modes" role="tablist" aria-label="View mode">
            {([
              { key: "staff", label: "Staff" },
              { key: "manager", label: "Manager" },
              { key: "stats", label: "Stats" },
            ] as { key: Mode; label: string }[]).map((t) => {
              const on = mode === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={on}
                  className="sd-mode"
                  style={{
                    background: on ? "#ffffff" : "transparent",
                    color: on ? "oklch(0.32 0.04 195)" : "oklch(0.52 0.02 200)",
                    boxShadow: on ? "0 1px 3px oklch(0.3 0.02 200 / 0.15)" : "none",
                  }}
                  onClick={() =>
                    setState((s) => ({
                      mode: t.key,
                      pickerFor: null,
                      lastChanged: null,
                      userMenuOpen: false,
                      inboxOpen: false,
                      addShiftDay: null,
                      sceneEpoch: s.sceneEpoch + 1,
                    }))
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <button onClick={resetDemo} className="sd-reset" title="Restore seeded demo data">
            Reset
          </button>
        </div>
      </header>

      <main className="sd-main">
        {/* ------------------------------------------------------------ stats */}
        {isStats && (
          <div>
            <h1 className="sd-title" style={{ marginBottom: 4 }}>
              Practice statistics
            </h1>
            <p className="sd-lede">
              Live from the in-memory demo data — changes as you claim, drop and assign.
            </p>

            <div className="sd-grid-cards">
              {/* Filled hours by role */}
              <div
                className="sd-card"
                style={{
                  padding: 18,
                  animation: "sd-riseIn 0.5s cubic-bezier(0.22, 0.9, 0.26, 1) 0.05s both",
                }}
              >
                <div className="sd-card-title">Filled hours by role</div>
                <div className="sd-card-sub" style={{ marginBottom: 14 }}>
                  Current week
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {ROLES.map((r) => {
                    const rs = weekShifts.filter((s) => s.role === r);
                    const filledH = hrs(rs.filter((s) => s.assignee));
                    const openH = hrs(rs.filter((s) => !s.assignee));
                    return (
                      <div key={r}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12.5,
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{r}</span>
                          <span style={{ color: "var(--sd-muted)" }}>
                            {filledH} hrs filled · {openH} open
                          </span>
                        </div>
                        <div
                          className="sd-track"
                          style={{ height: 9, display: "flex" }}
                        >
                          <div
                            className="sd-track-fill"
                            style={{
                              background: ACCENT_STRONG,
                              width: `${Math.round((filledH / ROLE_HOURS_SCALE) * 100)}%`,
                              animation:
                                "sd-growX 0.7s cubic-bezier(0.22, 0.9, 0.26, 1) 0.2s both",
                            }}
                          />
                          <div
                            className="sd-track-fill"
                            style={{
                              background: "oklch(0.85 0.06 60)",
                              width: `${Math.round((openH / ROLE_HOURS_SCALE) * 100)}%`,
                              animation:
                                "sd-growX 0.7s cubic-bezier(0.22, 0.9, 0.26, 1) 0.35s both",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="sd-legend">
                  <span className="sd-legend-item">
                    <span className="sd-swatch" style={{ background: ACCENT_STRONG }} />
                    Filled
                  </span>
                  <span className="sd-legend-item">
                    <span className="sd-swatch" style={{ background: "oklch(0.85 0.06 60)" }} />
                    Open
                  </span>
                </div>
              </div>

              {/* Coverage by week */}
              <div
                className="sd-card"
                style={{
                  padding: 18,
                  animation: "sd-riseIn 0.5s cubic-bezier(0.22, 0.9, 0.26, 1) 0.15s both",
                }}
              >
                <div className="sd-card-title">Coverage by week</div>
                <div className="sd-card-sub" style={{ marginBottom: 14 }}>
                  Filled shifts as % of scheduled
                </div>
                <div className="sd-bars">
                  {WEEKS.map((w, wi) => {
                    const ws = shifts.filter((s) => s.week === wi);
                    const pct = ws.length
                      ? Math.round((ws.filter((s) => s.assignee).length / ws.length) * 100)
                      : 0;
                    const current = wi === weekIdx;
                    return (
                      <div key={w.label} className="sd-bar-col">
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: current ? "oklch(0.4 0.06 195)" : "var(--sd-muted)",
                          }}
                        >
                          {pct}%
                        </span>
                        <div
                          className="sd-bar"
                          style={{
                            height: `${Math.max(6, pct)}%`,
                            background: current ? ACCENT : "oklch(0.85 0.03 195)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11.5,
                            color: "var(--sd-muted)",
                            textAlign: "center",
                          }}
                        >
                          {w.label.replace("Week of ", "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hours per person */}
              <div
                className="sd-card"
                style={{
                  padding: 18,
                  animation: "sd-riseIn 0.5s cubic-bezier(0.22, 0.9, 0.26, 1) 0.25s both",
                }}
              >
                <div className="sd-card-title">Hours per person</div>
                <div className="sd-card-sub" style={{ marginBottom: 14 }}>
                  Current week, vs {HOURS_TARGET} hr target
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {staffStats.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {avatar(p, 24)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                            fontSize: 12.5,
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ color: "oklch(0.5 0.02 200)" }}>{p.hours} hrs</span>
                        </div>
                        <div className="sd-track" style={{ height: 5, marginTop: 3 }}>
                          <div
                            className="sd-track-fill"
                            style={{
                              background: p.color,
                              width: p.barWidth,
                              animation:
                                "sd-growX 0.6s cubic-bezier(0.22, 0.9, 0.26, 1) 0.3s both",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- calendar */}
        {!isStats && (
          <>
            {/* Week nav + summary */}
            <div className="sd-weekbar">
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
                >
                  <button
                    onClick={() => {
                      if (weekIdx > 0) {
                        snapshotRects();
                        setState({ weekIdx: weekIdx - 1, pickerFor: null, addShiftDay: null });
                      }
                    }}
                    aria-label="Previous week"
                    disabled={weekIdx === 0}
                    className="sd-navbtn"
                    style={{
                      cursor: weekIdx > 0 ? "pointer" : "default",
                      opacity: weekIdx > 0 ? 1 : 0.35,
                    }}
                  >
                    ‹
                  </button>
                  <h1 className="sd-weeklabel">{week.label} 2026</h1>
                  <button
                    onClick={() => {
                      if (weekIdx < LAST_WEEK) {
                        snapshotRects();
                        setState({ weekIdx: weekIdx + 1, pickerFor: null, addShiftDay: null });
                      }
                    }}
                    aria-label="Next week"
                    disabled={weekIdx === LAST_WEEK}
                    className="sd-navbtn"
                    style={{
                      cursor: weekIdx < LAST_WEEK ? "pointer" : "default",
                      opacity: weekIdx < LAST_WEEK ? 1 : 0.35,
                    }}
                  >
                    ›
                  </button>
                  {isPastWeek && <span className="sd-readonly">Past week · read only</span>}
                </div>
                <p className="sd-subheading">
                  {isStaff
                    ? `Signed in as ${me.name} · ${me.role} — claim open shifts, or tap a card for details.`
                    : "Team coverage overview — assign open shifts, or tap a card for details."}
                </p>
              </div>

              {isStaff && (
                <div className="sd-mystrip">
                  {avatar(me, 30)}
                  <div>
                    <div style={{ fontSize: 12, color: "var(--sd-muted)" }}>
                      My shifts this week
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>
                      {mine.length} shifts · {hrs(mine)} hrs{" "}
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: 12.5,
                          color: "var(--sd-muted)",
                        }}
                      >
                        of {HOURS_TARGET} target
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isManager && (
                <div className="sd-kpis">
                  {[
                    { label: "Total shifts", value: weekShifts.length, color: undefined },
                    { label: "Filled", value: filledCount, color: ACCENT },
                    { label: "Open", value: openCount, color: OPEN },
                    {
                      label: "Coverage",
                      value: `${
                        weekShifts.length
                          ? Math.round((filledCount / weekShifts.length) * 100)
                          : 0
                      }%`,
                      color: undefined,
                    },
                  ].map((k, i) => (
                    <div
                      key={k.label}
                      className="sd-kpi"
                      style={{
                        animation: `sd-riseIn 0.4s cubic-bezier(0.22, 0.9, 0.26, 1) ${
                          0.05 + i * 0.07
                        }s both`,
                      }}
                    >
                      <div className="sd-kpi-label">{k.label}</div>
                      <div className="sd-kpi-value" style={{ color: k.color }}>
                        {k.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="sd-filters">
              <span className="sd-filters-label">Filter:</span>
              {chip("All roles", roleFilter === null, () => {
                snapshotRects();
                setState({ roleFilter: null });
              })}
              {ROLES.map((r) =>
                chip(r, roleFilter === r, () => {
                  snapshotRects();
                  setState({ roleFilter: r });
                })
              )}
              <span className="sd-divider" />
              {chip(
                "Open shifts only",
                openOnly,
                () => {
                  snapshotRects();
                  setState({ openOnly: !openOnly });
                },
                OPEN
              )}
            </div>

            {/* Mobile day tabs */}
            {narrow && (
              <div className="sd-daytabs">
                {DAY_NAMES.map((n, i) => {
                  const on = activeDay === i;
                  const hasOpen = weekShifts.some((s) => s.day === i && !s.assignee);
                  return (
                    <button
                      key={n}
                      className="sd-daytab"
                      aria-pressed={on}
                      onClick={() => {
                        snapshotRects();
                        setState({ activeDay: i });
                      }}
                      style={{
                        background: on ? ACCENT : "#ffffff",
                        color: on ? "#ffffff" : "oklch(0.48 0.02 200)",
                        border: `1px solid ${on ? ACCENT : "oklch(0.9 0.01 180)"}`,
                      }}
                    >
                      <span>{n}</span>
                      {hasOpen && (
                        <span
                          className="sd-dot"
                          style={{ width: 6, height: 6, background: on ? "#ffffff" : OPEN }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Week grid */}
            <div className="sd-week">
              {visibleDays.map((di) => {
                const name = DAY_NAMES[di];
                const all = shifts
                  .filter((s) => s.week === weekIdx && s.day === di)
                  .sort((a, b) => a.start - b.start);
                const visible = all.filter(
                  (s) => (!roleFilter || s.role === roleFilter) && (!openOnly || !s.assignee)
                );
                const meOff = isOff(currentUser, weekIdx, di);
                const dayOpen = all.filter((s) => !s.assignee).length;
                const dayFilled = all.length - dayOpen;
                const offStaff = STAFF.filter((p) => isOff(p.id, weekIdx, di));

                const showAddBtn = isManager && !isPastWeek && addShiftDay !== di;
                const addFormOpen = isManager && !isPastWeek && addShiftDay === di;
                // Managers always keep the "+ Add shift" affordance, so an
                // empty column only reads as empty for staff.
                const showEmpty = visible.length === 0 && !(isManager && !isPastWeek);

                return (
                  <div
                    key={di}
                    className="sd-day"
                    style={{
                      animation: `${sceneName} 0.5s cubic-bezier(0.22, 0.9, 0.26, 1) ${
                        narrow ? 0.15 : 0.15 + di * 0.06
                      }s both`,
                    }}
                  >
                    <div className="sd-day-head">
                      <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                        <span className="sd-day-name">{name}</span>
                        <span className="sd-day-date">{week.dates[di]}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {isManager && dayOpen > 0 && (
                          <span className="sd-gapflag">{dayOpen} open</span>
                        )}
                        {isStaff && !isPastWeek && (
                          <button
                            onClick={() => toggleOff(di)}
                            title="Mark this day as unavailable"
                            aria-pressed={meOff}
                            className="sd-offbtn"
                            style={{
                              background: meOff ? OPEN : "#ffffff",
                              color: meOff ? "#ffffff" : "var(--sd-muted)",
                              border: `1px solid ${meOff ? OPEN : "oklch(0.9 0.01 180)"}`,
                            }}
                          >
                            {meOff ? "Off ✓" : "Day off"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Manager: coverage bar + who's off */}
                    {isManager && (
                      <div style={{ padding: "0 4px" }}>
                        <div className="sd-coverage">
                          <div
                            className="sd-coverage-fill"
                            style={{
                              width: `${
                                all.length ? Math.round((dayFilled / all.length) * 100) : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="sd-coverage-meta">
                          <span className="sd-coverage-label">
                            {dayFilled} of {all.length} filled
                          </span>
                          {offStaff.length > 0 && (
                            <span className="sd-offlist">
                              off:
                              {offStaff.map((o) => (
                                <span key={o.id} title={o.name}>
                                  {avatar(o, 16, { opacity: 0.55 })}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {showEmpty && (
                      <div className="sd-day-empty">
                        {all.length === 0 ? "No shifts scheduled" : "No shifts match filter"}
                      </div>
                    )}

                    {/* Shift cards */}
                    {visible.map((s) => {
                      const assignee = s.assignee ? BY_ID[s.assignee] : null;
                      const isMine = s.assignee === currentUser;
                      const isOpen = !s.assignee;

                      let action: { label: string; run: () => void } | null = null;
                      if (!isPastWeek) {
                        if (isStaff && isOpen && !meOff) {
                          action = { label: "Claim", run: () => claim(s) };
                        } else if (isStaff && isMine) {
                          action = { label: "Drop", run: () => drop(s) };
                        } else if (isManager && isOpen) {
                          action = {
                            label: "Assign",
                            run: () => setState({ pickerFor: pickerFor === s.id ? null : s.id }),
                          };
                        } else if (isManager && !isOpen) {
                          action = { label: "Unassign", run: () => unassign(s) };
                        }
                      }

                      const pickerOpen = isManager && pickerFor === s.id && isOpen;
                      const candidates = pickerOpen
                        ? STAFF.filter(
                            (p) =>
                              p.role === s.role &&
                              !conflictFor(p.id, s) &&
                              !isOff(p.id, s.week, s.day)
                          )
                        : [];

                      const openAction = isOpen && isStaff;

                      return (
                        <div
                          key={s.id}
                          data-shift-id={s.id}
                          className="sd-shift"
                          role="button"
                          tabIndex={0}
                          onClick={() => setState({ detailFor: s.id })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setState({ detailFor: s.id });
                            }
                          }}
                          style={{
                            border: `1.5px ${isOpen ? "dashed" : "solid"} ${
                              isOpen
                                ? OPEN_LINE
                                : isMine && isStaff
                                  ? "oklch(0.72 0.07 195)"
                                  : "oklch(0.93 0.008 180)"
                            }`,
                            background: isOpen
                              ? "oklch(0.985 0.012 75)"
                              : isMine && isStaff
                                ? "oklch(0.97 0.015 195)"
                                : "#ffffff",
                            animation:
                              state.lastChanged === s.id
                                ? "sd-cardPulse 0.8s cubic-bezier(0.22, 0.9, 0.26, 1)"
                                : isOpen && !isPastWeek
                                  ? "sd-dashPulse 2.8s ease-in-out infinite"
                                  : "none",
                          }}
                        >
                          <div className="sd-shift-top">
                            <span className="sd-shift-role">{s.role}</span>
                            <span className="sd-shift-time">
                              {fmtTime(s.start)}–{fmtTime(s.end)}
                            </span>
                          </div>

                          {s.note && <span className="sd-shift-note">{s.note}</span>}

                          <div className="sd-shift-bottom">
                            <div className="sd-shift-who">
                              {avatar(assignee, 22)}
                              <span
                                className="sd-shift-name"
                                style={{ color: isOpen ? OPEN : "var(--sd-ink-2)" }}
                              >
                                {isOpen
                                  ? "Open"
                                  : isMine && isStaff
                                    ? `${assignee!.name} (you)`
                                    : assignee!.name}
                              </span>
                            </div>

                            {action && (
                              <button
                                className="sd-shift-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action!.run();
                                }}
                                style={{
                                  border: openAction ? "none" : "1px solid oklch(0.88 0.02 195)",
                                  background: openAction ? ACCENT : "#ffffff",
                                  color: openAction ? "#ffffff" : "oklch(0.45 0.05 195)",
                                }}
                              >
                                {action.label}
                              </button>
                            )}
                          </div>

                          {/* Manager: assign picker */}
                          {pickerOpen && (
                            <div className="sd-picker" onClick={(e) => e.stopPropagation()}>
                              <span className="sd-picker-label">Assign to:</span>
                              {candidates.map((c) => (
                                <button
                                  key={c.id}
                                  className="sd-candidate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    assign(s, c.id);
                                  }}
                                >
                                  <span
                                    className="sd-dot"
                                    style={{ width: 18, height: 18, background: c.color }}
                                  />
                                  <span className="sd-candidate-name">{c.name}</span>
                                  <span className="sd-candidate-load">
                                    {Math.round(workload(c.id) * 10) / 10} hrs
                                  </span>
                                </button>
                              ))}
                              {candidates.length === 0 && (
                                <span className="sd-picker-empty">
                                  No available staff for this role
                                </span>
                              )}
                              <button
                                className="sd-picker-cancel"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setState({ pickerFor: null });
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Manager: add shift */}
                    {showAddBtn && (
                      <button
                        className="sd-addbtn"
                        onClick={() => setState({ addShiftDay: di, pickerFor: null })}
                      >
                        + Add shift
                      </button>
                    )}

                    {addFormOpen && (
                      <div className="sd-addform">
                        <span className="sd-addform-title">New open shift — {name}</span>
                        <select
                          className="sd-select"
                          aria-label="Role"
                          value={state.addRole}
                          onChange={(e) => setState({ addRole: e.target.value as Role })}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <select
                          className="sd-select"
                          aria-label="Time slot"
                          value={state.addSlot}
                          onChange={(e) => setState({ addSlot: e.target.value as Slot })}
                        >
                          <option value="morning">Morning · 8:00–13:00</option>
                          <option value="afternoon">Afternoon · 13:00–18:00</option>
                          <option value="evening">Evening · 17:00–20:30</option>
                        </select>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="sd-submit" onClick={() => addShift(di)}>
                            Add shift
                          </button>
                          <button
                            className="sd-cancel"
                            onClick={() => setState({ addShiftDay: null })}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lower panels */}
            <div className="sd-panels">
              {isStaff && (
                <div
                  className="sd-panel"
                  style={{
                    animation: "sd-riseIn 0.5s cubic-bezier(0.22, 0.9, 0.26, 1) 0.1s both",
                  }}
                >
                  <div className="sd-card-title" style={{ marginBottom: 10 }}>
                    My schedule this week
                  </div>
                  {mine.length === 0 && (
                    <div className="sd-empty-note">
                      No shifts this week — claim an open one above.
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {mine.map((s) => (
                      <div key={s.id} className="sd-myshift">
                        <span className="sd-myshift-day">{DAY_NAMES[s.day]}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{s.role}</div>
                          <div style={{ fontSize: 11.5, color: "var(--sd-muted)" }}>
                            {fmtTime(s.start)}–{fmtTime(s.end)} ·{" "}
                            {Math.round((s.end - s.start) * 10) / 10} hrs
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isManager && (
                <div
                  className="sd-panel"
                  style={{
                    animation: "sd-riseIn 0.5s cubic-bezier(0.22, 0.9, 0.26, 1) 0.1s both",
                  }}
                >
                  <div className="sd-card-title">Team this week</div>
                  <div className="sd-card-sub" style={{ marginBottom: 12 }}>
                    Hours vs {HOURS_TARGET} hr weekly target
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {staffStats.map((p) => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {avatar(p, 26)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {p.name}{" "}
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "oklch(0.58 0.02 200)",
                                  fontSize: 12,
                                }}
                              >
                                {p.role}
                              </span>
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: "oklch(0.5 0.02 200)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.shiftCount} shifts · {p.hours} hrs
                            </span>
                          </div>
                          <div className="sd-track" style={{ height: 5, marginTop: 4 }}>
                            <div
                              className="sd-track-fill"
                              style={{
                                background: p.color,
                                width: p.barWidth,
                                animation:
                                  "sd-growX 0.6s cubic-bezier(0.22, 0.9, 0.26, 1) 0.3s both",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="sd-panel"
                style={{
                  animation: "sd-riseIn 0.5s cubic-bezier(0.22, 0.9, 0.26, 1) 0.18s both",
                }}
              >
                <div className="sd-card-title" style={{ marginBottom: 10 }}>
                  Recent activity
                </div>
                {log.length === 0 ? (
                  <div className="sd-empty-note" style={{ padding: "6px 0" }}>
                    No changes yet this session. Claim, drop or assign a shift and it will show
                    up here.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {log.map((e, i) => (
                      <div key={i} className="sd-activity">
                        <span
                          className="sd-dot"
                          style={{ width: 7, height: 7, background: e.dot, marginTop: 5 }}
                        />
                        <span style={{ flex: 1 }}>{e.text}</span>
                        <span className="sd-activity-when">{e.when}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <p className="sd-footnote">
          Portfolio demo — seeded data, no backend. Refresh or “Reset” to restore the starting
          state.
        </p>
      </main>

      {/* ------------------------------------------------------- detail modal */}
      {detailShift &&
        (() => {
          const a = detailShift.assignee ? BY_ID[detailShift.assignee] : null;
          const wk = WEEKS[detailShift.week];
          const entries = [
            ...(history[detailShift.id] ?? []),
            { text: "Created from the weekly rota template", when: "Seeded" },
          ];

          return (
            <div className="sd-backdrop" onClick={closeDetail}>
              <div
                className="sd-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`${detailShift.role} shift detail`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sd-modal-head">
                  <div>
                    <div className="sd-modal-title">{detailShift.role}</div>
                    <div className="sd-modal-sub">
                      {DAY_NAMES[detailShift.day]} {wk.dates[detailShift.day]} ·{" "}
                      {fmtTime(detailShift.start)}–{fmtTime(detailShift.end)} ·{" "}
                      {Math.round((detailShift.end - detailShift.start) * 10) / 10} hrs
                    </div>
                  </div>
                  <button className="sd-modal-close" onClick={closeDetail} aria-label="Close">
                    ✕
                  </button>
                </div>

                {detailShift.note && <span className="sd-modal-note">{detailShift.note}</span>}

                <div
                  className="sd-modal-status"
                  style={{
                    background: a ? "oklch(0.97 0.01 195)" : "oklch(0.975 0.02 75)",
                  }}
                >
                  {avatar(a, 26)}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: a ? "oklch(0.35 0.03 195)" : OPEN,
                      }}
                    >
                      {a ? a.name : "Open — needs cover"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--sd-muted)" }}>
                      {a ? a.role : "Anyone with the matching role can claim this shift"}
                    </div>
                  </div>
                </div>

                <div className="sd-modal-section">History</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {entries.map((h, i) => (
                    <div key={i} className="sd-hist">
                      <div className="sd-hist-rail">
                        <span className="sd-hist-dot" />
                        <span className="sd-hist-line" />
                      </div>
                      <div style={{ flex: 1, paddingBottom: 6 }}>
                        <div className="sd-hist-text">{h.text}</div>
                        <div className="sd-hist-when">{h.when}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

      {/* --------------------------------------------------------------- toast */}
      {state.toast && (
        <div
          className="sd-toast"
          role="status"
          aria-live="polite"
          style={{
            background:
              state.toastKind === "warn" ? "oklch(0.5 0.12 45)" : "oklch(0.3 0.02 200)",
          }}
        >
          {state.toast}
        </div>
      )}
    </div>
  );
}
