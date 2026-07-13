import { BOOKS, type Book } from "./data";

/**
 * The "peek inside a shelf" view.
 *
 * Most spines are set dressing — a shelf with six books on it would look wrong.
 * They're generated from a PRNG seeded by the shelf's id, so a given shelf looks
 * identical every time you open it rather than reshuffling on each render, but we
 * don't have to hand-author 500 fake books.
 *
 * The catalogued titles are then placed among them as darker, taller spines.
 */

export interface Spine {
  flex: number;
  height: string;
  bg: string;
  /** Set only for real catalogued titles; filler spines leave this undefined. */
  book?: Book;
}

export interface ShelfView {
  rows: Spine[][];
  /** Row index holding the active book, or -1. */
  targetRow: number;
}

const PALETTE = [
  "#A8988A",
  "#8C7B6B",
  "#B5A48E",
  "#9C8468",
  "#7D8A77",
  "#8A7D8E",
  "#C0AD92",
  "#6E6B64",
];

const CATALOGUED = "#4A453C";

export function buildShelfView(
  shelfId: string,
  activeBook: Book | null,
  accent: string
): ShelfView {
  const booksHere = BOOKS.filter((b) => b.shelf === shelfId);
  const rowCount = shelfId === "NR" ? 2 : 3;

  // Deterministic per shelf: same shelf, same arrangement, every time.
  let seed = 7;
  for (let i = 0; i < shelfId.length; i++) seed = seed * 31 + shelfId.charCodeAt(i);
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return Math.abs(seed) % n;
  };

  const rows: Spine[][] = [];
  for (let r = 0; r < rowCount; r++) {
    const spines: Spine[] = [];
    const count = 14 + rand(5);
    for (let i = 0; i < count; i++) {
      spines.push({
        flex: 8 + rand(14),
        height: `${62 + rand(28)}%`,
        bg: PALETTE[rand(PALETTE.length)],
      });
    }
    rows.push(spines);
  }

  let targetRow = -1;

  booksHere.forEach((b, k) => {
    const row = rows[k % rowCount];
    const isTarget = !!activeBook && activeBook.id === b.id;

    // Spread the real titles across the row rather than clumping them at one end.
    let idx = 2 + ((k * 5 + rand(4)) % (row.length - 4));
    // If that slot already holds a real title, take the next free one — otherwise
    // a collision would silently drop a book (possibly the one we're pointing at).
    for (let probe = 0; row[idx].book && probe < row.length; probe++) {
      idx = (idx + 1) % row.length;
    }

    if (isTarget) targetRow = k % rowCount;

    row[idx] = {
      flex: 14 + (b.title.length % 9),
      height: isTarget ? "97%" : "88%",
      bg: isTarget ? accent : CATALOGUED,
      book: b,
    };
  });

  return { rows, targetRow };
}
