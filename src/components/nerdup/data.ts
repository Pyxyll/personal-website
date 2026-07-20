/**
 * Content for the Nerd-Up Collective concept.
 *
 * Everything here is placeholder standing in for the shop's real catalogue.
 * Products are named after what their stock photo actually shows rather than
 * the reverse — a listing whose title disagrees with its picture is the fastest
 * way to make a shop mock look fake.
 *
 * Prices are plausible Irish second-hand retail, not quotes.
 */

export const shop = {
  name: "Nerd-Up Collective",
  /** Inside Eclectic Avenue, an indoor market of independent traders. */
  venue: "Eclectic Avenue",
  street: "North Main Street",
  town: "Wexford",
  facebook: "https://www.facebook.com/p/Nerd-Up-61571706656848/",
  directions: "https://www.google.com/maps/search/?api=1&query=Eclectic+Avenue+North+Main+Street+Wexford",
  /** Eclectic Avenue's market days. Confirm with the shop before sending. */
  hours: [
    { days: "Saturday", time: "10:00 – 17:00" },
    { days: "Sunday", time: "10:00 – 17:00" },
  ],
} as const;

export interface Product {
  slug: string;
  name: string;
  category: string;
  /** Platform, label, publisher — whatever the second line should say. */
  meta: string;
  price: number;
  condition: string;
  img: string;
  alt: string;
  /** Shown on the listing card. */
  blurb: string;
  /** Shown on the product page. */
  detail: string;
  /** Drives the "Just in" wall on the home page. */
  justIn?: string;
  stock: number;
}

/**
 * The design's own eight aisles, kept intact — the range is the shop's whole
 * pitch, so collapsing it into fewer, tidier buckets undersells them.
 */
export const categories = [
  { slug: "games", name: "Consoles & games", line: "Atari Jaguar through modern PlayStation & Xbox." },
  { slug: "music", name: "Vinyl & tapes", line: "Records, cassettes and the odd rarity." },
  { slug: "film", name: "VHS & film", line: "Tapes, cases and cult classics." },
  { slug: "comics", name: "Comics, manga & books", line: "Single issues, graphic novels, manga runs." },
  { slug: "print", name: "Magazines & print", line: "Gaming mags, old ads, printed nostalgia." },
  { slug: "tech", name: "Audio & tech", line: "Radios, CD players, CRT TVs, hardware." },
  { slug: "figures", name: "Figures & toys", line: "Boxed figures, toys and skateboards." },
  { slug: "oddities", name: "Oddities & trinkets", line: "The bits that defy a category." },
] as const;

export const products: Product[] = [
  {
    slug: "nes-console",
    name: "Nintendo Entertainment System",
    category: "games",
    meta: "Nintendo · 1985 · PAL",
    price: 140,
    condition: "Used — tested, working",
    img: "/demos/nerd-up/console.jpg",
    alt: "A Nintendo Entertainment System console",
    blurb: "The original grey box, cleaned, recapped and tested.",
    detail:
      "Front-loader NES in good cosmetic condition for its age. Cartridge slot has been cleaned and the 72-pin connector replaced, so it locks in first time instead of doing the famous blinking-light routine. Comes with one controller, RF lead and power supply.",
    justIn: "Jul 18",
    stock: 1,
  },
  {
    slug: "famicom-cart-lot",
    name: "Famicom cartridge lot",
    category: "games",
    meta: "Nintendo Famicom · Japanese import",
    price: 65,
    condition: "Used — labels intact",
    img: "/demos/nerd-up/famicom.jpg",
    alt: "Japanese Famicom cartridges including Akumajou Dracula and Pro Wrestling",
    blurb: "Four Japanese imports, Akumajou Dracula among them.",
    detail:
      "A small lot of Japanese Famicom carts with the artwork still bright — the Famicom label printing has held up far better than western equivalents. Includes Akumajou Dracula (the Japanese Castlevania), Pro Wrestling and two Jaleco platformers. Needs a Famicom or an adapter; won't sit in a western NES without one.",
    justIn: "Jul 17",
    stock: 1,
  },
  {
    slug: "pokemon-red-gameboy",
    name: "Pokémon Red",
    category: "games",
    meta: "Game Boy · 1996 · PAL",
    price: 55,
    condition: "Used — saves reliably",
    img: "/demos/nerd-up/gameboy.jpg",
    alt: "A red Pokémon Game Boy cartridge on a yellow background",
    blurb: "Cart only, with a fresh save battery fitted.",
    detail:
      "Original Game Boy Pokémon Red. The save battery has been replaced, which is the thing that kills most copies of this — an untested one off the internet will usually lose your save overnight. This one has been left running for a week to confirm it holds.",
    justIn: "Jul 16",
    stock: 2,
  },
  {
    slug: "zelda-breath-of-the-wild",
    name: "The Legend of Zelda: Breath of the Wild",
    category: "games",
    meta: "Nintendo Switch · 2017",
    price: 38,
    condition: "Used — cart and case",
    img: "/demos/nerd-up/switch.jpg",
    alt: "Nintendo Switch game cartridges on a wooden desk",
    blurb: "Traded in this week, case and insert included.",
    detail:
      "Switch copy with the original case and insert. We take current-gen trade-ins as well as retro, and they turn over fast — if it's listed, it's on the shelf.",
    justIn: "Jul 15",
    stock: 3,
  },
  {
    slug: "commodore-cbm-setup",
    name: "Commodore CBM setup",
    category: "tech",
    meta: "Commodore · Model 8032 · with datasette",
    price: 180,
    condition: "Used — powers on, sold as seen",
    img: "/demos/nerd-up/commodore.jpg",
    alt: "A Commodore CBM computer with a datasette and cassette software",
    blurb: "Machine, datasette and a stack of tape software.",
    detail:
      "A proper piece of computing history. Powers on to the boot screen and the datasette spins, but we haven't loaded every tape in the pile, so it's sold as seen. Comes with the cassette software shown and a joystick. Heavy — collection in person only, this one isn't going in a jiffy bag.",
    justIn: "Jul 14",
    stock: 1,
  },
  {
    slug: "vhs-horror-bundle",
    name: "Horror VHS bundle",
    category: "film",
    meta: "The Exorcist · Creepshow · Stephen King",
    price: 26,
    condition: "Used — tapes play, sleeves worn",
    img: "/demos/nerd-up/vhs.jpg",
    alt: "Shelves of stacked VHS tapes with handwritten labels",
    blurb: "Five tapes, big-box horror included.",
    detail:
      "A bundle pulled from the horror shelf: sleeves have shelf-wear and a couple have rental stickers, which we'd argue is the point. All five have been spot-checked and play without tracking trouble.",
    justIn: "Jul 13",
    stock: 1,
  },
  {
    slug: "marvel-90s-run",
    name: "90s Marvel bundle",
    category: "comics",
    meta: "Marvel · Dark Horse · bagged",
    price: 30,
    condition: "Used — bagged and boarded",
    img: "/demos/nerd-up/comics.jpg",
    alt: "A fan of bagged 1990s comic issues including Spider-Man and Silver Surfer",
    blurb: "Eight issues, Spider-Man 2099 and Silver Surfer among them.",
    detail:
      "A starter bundle of 90s single issues, all bagged and boarded. Condition is reader-grade rather than collector-grade — these are meant to be taken out and read, not slabbed.",
    justIn: "Jul 12",
    stock: 1,
  },
  {
    slug: "retro-vinyl-figures",
    name: "Retro vinyl figures",
    category: "figures",
    meta: "Sofubi style · assorted",
    price: 26,
    condition: "Used — loose, no boxes",
    img: "/demos/nerd-up/figures.jpg",
    alt: "A shelf of retro vinyl character figures",
    blurb: "Loose sofubi-style figures, priced individually.",
    detail:
      "A rotating shelf of loose vinyl figures — the sort that turn up in job lots and get picked over within a fortnight. Priced individually in store; the photo is the current shelf rather than a specific piece, so it's worth a look in person.",
    stock: 12,
  },
  {
    slug: "snoopy-plush",
    name: "Flying Ace Snoopy plush",
    category: "figures",
    meta: "Peanuts · vintage",
    price: 18,
    condition: "Used — clean, good pile",
    img: "/demos/nerd-up/plush.jpg",
    alt: "A large Snoopy plush in flying-ace goggles sitting in a box of small figurines",
    blurb: "Goggles and scarf intact, which is rare.",
    detail:
      "Large Flying Ace Snoopy with the goggles and scarf still attached — usually the first things to go missing. Clean, no odours, pile is in good shape.",
    stock: 1,
  },
  {
    slug: "framed-vintage-prints",
    name: "Framed vintage prints",
    category: "print",
    meta: "Original mid-century travel posters",
    price: 40,
    condition: "Used — original frames",
    img: "/demos/nerd-up/artprint.jpg",
    alt: "Framed vintage travel posters leaning against a shop window",
    blurb: "Mid-century travel posters in their original frames.",
    detail:
      "A run of framed mid-century travel posters, sold individually. Frames are original and show their age; the print work underneath is what you're buying. Priced per frame, come and pick the one you want.",
    stock: 6,
  },
  {
    slug: "minerva-valve-radio",
    name: "Minerva valve radio",
    category: "tech",
    meta: "Minerva · walnut case",
    price: 95,
    condition: "Restored — working",
    img: "/demos/nerd-up/audio.jpg",
    alt: "A vintage wooden Minerva valve radio with an illuminated dial",
    blurb: "Restored, dial lit, and it actually tunes.",
    detail:
      "Walnut-cased Minerva with the station dial intact and lit. It's been gone through electrically — new mains lead and the perished capacitors replaced — so it can be plugged in without drama. Tunes and sounds like it should.",
    stock: 1,
  },
  {
    slug: "jazz-vinyl-selection",
    name: "Jazz vinyl selection",
    category: "music",
    meta: "Second-hand LPs · graded",
    price: 22,
    condition: "Used — VG+ or better",
    img: "/demos/nerd-up/vinyl.jpg",
    alt: "Racks of second-hand records in a shop, divided by artist",
    blurb: "Graded second-hand LPs, priced from €8.",
    detail:
      "The jazz section, restocked most weeks. Everything is graded by eye and played before it goes out — anything below VG+ goes in the bargain crate rather than the racks. Priced from €8; the €22 is a typical mid-shelf title.",
    stock: 40,
  },
  {
    slug: "retro-games-magazines",
    name: "Retro games magazines",
    category: "print",
    meta: "Assorted titles · 80s–00s",
    price: 6,
    condition: "Used — reading copies",
    img: "/demos/nerd-up/mags.jpg",
    alt: "A rack stacked with print magazines",
    blurb: "Back issues from €6, dig through the rack.",
    detail:
      "A crate of back issues — gaming monthlies, film mags and the odd computing title. Half the fun is the adverts. Priced from €6 depending on issue and condition; the rack is picked over and refilled constantly.",
    stock: 30,
  },
  {
    slug: "curio-shelf",
    name: "The curio shelf",
    category: "oddities",
    meta: "Assorted · one-offs",
    price: 12,
    condition: "Used — as found",
    img: "/demos/nerd-up/oddities.jpg",
    alt: "Shelves crowded with assorted antique trinkets and curiosities",
    blurb: "The bits that defy a category. Priced from €4.",
    detail:
      "Every house clearance turns up things that don't belong in any aisle, so they get a shelf of their own — trinkets, desk oddities, brass whatsits and the occasional genuinely puzzling object. Priced from €4. This one changes faster than anything else in the shop.",
    stock: 20,
  },
];

export const byCategory = (slug: string) =>
  slug === "all" ? products : products.filter((p) => p.category === slug);

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);

export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? slug;

/** The home page's "Just in" wall — newest arrivals, newest first. */
export const justIn = products.filter((p) => p.justIn);

export const euro = (n: number) => `€${n.toFixed(2).replace(/\.00$/, "")}`;
