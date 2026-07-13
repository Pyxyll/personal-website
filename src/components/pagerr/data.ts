/**
 * Seeded catalogue for the Pagerr demo: one bookshop's floor plan and stock.
 *
 * Shelf geometry is expressed in percentages of the floor-plan box, so the map
 * scales with its container and the route maths can stay in the same units.
 */

export type SectionId = "fic1" | "fic2" | "fic3" | "nonf" | "kids" | "ref" | "nw";

export interface Shelf {
  id: string;
  sec: SectionId;
  label: string;
  /** Position and size as % of the floor-plan box. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  shelf: string;
  stock: number;
}

export const SECTIONS: Record<SectionId, string> = {
  fic1: "Fiction A–F",
  fic2: "Fiction G–L",
  fic3: "Fiction M–Z",
  nonf: "Non-Fiction",
  kids: "Children’s",
  ref: "Reference",
  nw: "New Releases",
};

export const SHELVES: Shelf[] = [
  { id: "RA", sec: "ref", label: "Back Wall, Shelf A", x: 6, y: 4, w: 20, h: 7 },
  { id: "RB", sec: "ref", label: "Back Wall, Shelf B", x: 28, y: 4, w: 20, h: 7 },
  { id: "RC", sec: "ref", label: "Back Wall, Shelf C", x: 50, y: 4, w: 20, h: 7 },
  { id: "KA", sec: "kids", label: "Children’s Corner, Shelf A", x: 79, y: 20, w: 15, h: 16 },
  { id: "KB", sec: "kids", label: "Children’s Corner, Shelf B", x: 79, y: 42, w: 15, h: 16 },
  { id: "1A", sec: "fic1", label: "Aisle 1, Shelf A", x: 6, y: 22, w: 11, h: 14 },
  { id: "1B", sec: "fic1", label: "Aisle 1, Shelf B", x: 6, y: 40, w: 11, h: 14 },
  { id: "1C", sec: "fic1", label: "Aisle 1, Shelf C", x: 6, y: 58, w: 11, h: 14 },
  { id: "2A", sec: "fic2", label: "Aisle 2, Shelf A", x: 24, y: 22, w: 11, h: 14 },
  { id: "2B", sec: "fic2", label: "Aisle 2, Shelf B", x: 24, y: 40, w: 11, h: 14 },
  { id: "2C", sec: "fic2", label: "Aisle 2, Shelf C", x: 24, y: 58, w: 11, h: 14 },
  { id: "3A", sec: "fic3", label: "Aisle 3, Shelf A", x: 42, y: 22, w: 11, h: 14 },
  { id: "3B", sec: "fic3", label: "Aisle 3, Shelf B", x: 42, y: 40, w: 11, h: 14 },
  { id: "3C", sec: "fic3", label: "Aisle 3, Shelf C", x: 42, y: 58, w: 11, h: 14 },
  { id: "4A", sec: "nonf", label: "Aisle 4, Shelf A", x: 60, y: 22, w: 11, h: 14 },
  { id: "4B", sec: "nonf", label: "Aisle 4, Shelf B", x: 60, y: 40, w: 11, h: 14 },
  { id: "4C", sec: "nonf", label: "Aisle 4, Shelf C", x: 60, y: 58, w: 11, h: 14 },
  { id: "NR", sec: "nw", label: "Front Table", x: 30, y: 85, w: 26, h: 9 },
];

export const CAPTIONS = [
  { name: "Fiction A–F", x: 2, y: 74, w: 19 },
  { name: "Fiction G–L", x: 20, y: 74, w: 19 },
  { name: "Fiction M–Z", x: 38, y: 74, w: 19 },
  { name: "Non-Fiction", x: 56, y: 74, w: 19 },
  { name: "Children’s", x: 77, y: 60.5, w: 19 },
  { name: "Reference", x: 26, y: 12.5, w: 24 },
  { name: "New Releases", x: 30, y: 80.5, w: 26 },
];

export const BOOKS: Book[] = [
  { id: 1, title: "Pride and Prejudice", author: "Jane Austen", shelf: "1A", stock: 4 },
  { id: 2, title: "The Handmaid’s Tale", author: "Margaret Atwood", shelf: "1A", stock: 3 },
  { id: 3, title: "Fahrenheit 451", author: "Ray Bradbury", shelf: "1A", stock: 5 },
  { id: 4, title: "Jane Eyre", author: "Charlotte Brontë", shelf: "1B", stock: 2 },
  { id: 5, title: "Murder on the Orient Express", author: "Agatha Christie", shelf: "1B", stock: 6 },
  { id: 6, title: "Great Expectations", author: "Charles Dickens", shelf: "1B", stock: 3 },
  { id: 7, title: "All the Light We Cannot See", author: "Anthony Doerr", shelf: "1C", stock: 4 },
  { id: 8, title: "Middlesex", author: "Jeffrey Eugenides", shelf: "1C", stock: 2 },
  { id: 9, title: "Gone Girl", author: "Gillian Flynn", shelf: "1C", stock: 5 },
  { id: 10, title: "American Gods", author: "Neil Gaiman", shelf: "2A", stock: 3 },
  { id: 11, title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", shelf: "2A", stock: 4 },
  { id: 12, title: "The Old Man and the Sea", author: "Ernest Hemingway", shelf: "2A", stock: 6 },
  { id: 13, title: "The Kite Runner", author: "Khaled Hosseini", shelf: "2B", stock: 3 },
  { id: 14, title: "Never Let Me Go", author: "Kazuo Ishiguro", shelf: "2B", stock: 2 },
  { id: 15, title: "A Prayer for Owen Meany", author: "John Irving", shelf: "2B", stock: 2 },
  { id: 16, title: "To Kill a Mockingbird", author: "Harper Lee", shelf: "2C", stock: 7 },
  { id: 17, title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", shelf: "2C", stock: 3 },
  { id: 18, title: "The Shining", author: "Stephen King", shelf: "2C", stock: 4 },
  { id: 19, title: "Beloved", author: "Toni Morrison", shelf: "3A", stock: 3 },
  { id: 20, title: "Cloud Atlas", author: "David Mitchell", shelf: "3A", stock: 2 },
  { id: 21, title: "The Road", author: "Cormac McCarthy", shelf: "3A", stock: 4 },
  { id: 22, title: "Nineteen Eighty-Four", author: "George Orwell", shelf: "3B", stock: 8 },
  { id: 23, title: "Normal People", author: "Sally Rooney", shelf: "3B", stock: 5 },
  { id: 24, title: "East of Eden", author: "John Steinbeck", shelf: "3B", stock: 3 },
  { id: 25, title: "The Secret History", author: "Donna Tartt", shelf: "3C", stock: 4 },
  { id: 26, title: "Mrs Dalloway", author: "Virginia Woolf", shelf: "3C", stock: 2 },
  { id: 27, title: "The Book Thief", author: "Markus Zusak", shelf: "3C", stock: 5 },
  { id: 28, title: "Sapiens", author: "Yuval Noah Harari", shelf: "4A", stock: 6 },
  { id: 29, title: "Educated", author: "Tara Westover", shelf: "4A", stock: 4 },
  { id: 30, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", shelf: "4A", stock: 3 },
  { id: 31, title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", shelf: "4B", stock: 2 },
  { id: 32, title: "Into the Wild", author: "Jon Krakauer", shelf: "4B", stock: 3 },
  { id: 33, title: "A Short History of Nearly Everything", author: "Bill Bryson", shelf: "4B", stock: 4 },
  { id: 34, title: "Quiet", author: "Susan Cain", shelf: "4C", stock: 3 },
  { id: 35, title: "The Sixth Extinction", author: "Elizabeth Kolbert", shelf: "4C", stock: 2 },
  { id: 36, title: "Born a Crime", author: "Trevor Noah", shelf: "4C", stock: 5 },
  { id: 37, title: "Charlotte’s Web", author: "E. B. White", shelf: "KA", stock: 6 },
  { id: 38, title: "Matilda", author: "Roald Dahl", shelf: "KA", stock: 7 },
  { id: 39, title: "The Very Hungry Caterpillar", author: "Eric Carle", shelf: "KA", stock: 9 },
  { id: 40, title: "Where the Wild Things Are", author: "Maurice Sendak", shelf: "KB", stock: 4 },
  { id: 41, title: "The Gruffalo", author: "Julia Donaldson", shelf: "KB", stock: 8 },
  { id: 42, title: "The Lightning Thief", author: "Rick Riordan", shelf: "KB", stock: 5 },
  { id: 43, title: "Oxford English Dictionary", author: "Oxford Languages", shelf: "RA", stock: 2 },
  { id: 44, title: "The Elements of Style", author: "Strunk & White", shelf: "RA", stock: 4 },
  { id: 45, title: "Collins World Atlas", author: "Collins Maps", shelf: "RB", stock: 3 },
  { id: 46, title: "The Chicago Manual of Style", author: "University of Chicago Press", shelf: "RB", stock: 2 },
  { id: 47, title: "Roget’s Thesaurus", author: "Peter Mark Roget", shelf: "RC", stock: 3 },
  { id: 48, title: "Encyclopedia of World History", author: "Oxford Reference", shelf: "RC", stock: 1 },
  { id: 49, title: "Fourth Wing", author: "Rebecca Yarros", shelf: "NR", stock: 10 },
  { id: 50, title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", shelf: "NR", stock: 7 },
  { id: 51, title: "Lessons in Chemistry", author: "Bonnie Garmus", shelf: "NR", stock: 8 },
  { id: 52, title: "The Covenant of Water", author: "Abraham Verghese", shelf: "NR", stock: 6 },
];

export const BOOK_BY_ID: Record<number, Book> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b])
);

export const SHELF_BY_ID: Record<string, Shelf> = Object.fromEntries(
  SHELVES.map((s) => [s.id, s])
);
