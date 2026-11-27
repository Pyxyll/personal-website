// What I'm doing now.
//
// A /now page (nownownow.com) is a summary of where things are at this stage
// of life, erased and replaced when it changes rather than kept as a log.
// Everything here is on /now/; the items with a `line` are also on the
// homepage, as that one line. One source, so the two never disagree.
//
// Nothing here about looking for work: people I work with read this site.

export interface NowItem {
  /** Keys the mark in components/NowMark.astro. */
  kind: "work" | "building" | "learning" | "reading" | "playing" | "thinking" | "off";
  label: string;
  /** The homepage's one line. Leave it out to keep an item to /now/. */
  line?: string;
  /** The /now page's paragraphs. */
  detail: string[];
}

export const now = {
  /** When this was last true. Change it whenever an item changes. */
  updated: "2026-11-27",
  items: [
    {
      kind: "work",
      label: "Work",
      line: "Lead developer on The B!G Idea's platform: live in schools since August, and a Tech 4 Good award in November.",
      detail: [
        "Lead developer on The B!G Idea's education platform. The new version went live in schools in August, and in November it won the Tech 4 Good Service Award at the Technology Ireland Industry Awards.",
        "These days it's the steady part after a launch: improvements, bug fixes and support.",
      ],
    },
    {
      kind: "building",
      label: "Building",
      line: "Back streaming on Twitch, on a stream system I built myself.",
      detail: [
        "I'm back streaming on Twitch, various games, on a setup I've built myself. It's called bootleg: one Bun and TypeScript program behind the overlays OBS shows, the chat bot, the alerts, and a Discord bot that posts when I go live and sums the stream up when I stop.",
        "It has its own OBS plugin, in C++ and Qt, because browser docks don't work in OBS on Wayland. Lately I've added !clip, so chat can clip the last thirty seconds, and a dungeon game chat votes its way through on the be-right-back screen, which hasn't been on stream yet.",
      ],
    },
    {
      kind: "learning",
      label: "Learning",
      line: "3D modelling, and Japanese before a trip there in January.",
      detail: [
        "Japanese, before a trip there in January. I can hold a basic conversation and read about half of the hiragana reliably; the other half is a work in progress.",
        "And 3D modelling: Blender for things to look at, FreeCAD for things to print.",
      ],
    },
    {
      kind: "reading",
      label: "Reading",
      line: "Journey Across Japan, by Chris Broad.",
      detail: ["Journey Across Japan, by Chris Broad. Research, technically."],
    },
    {
      kind: "playing",
      label: "Playing",
      line: "Yakuza 0 on the Steam Deck, and some classic Ratchet & Clank.",
      detail: ["On the Steam Deck: Yakuza 0, and the classic Ratchet & Clank games again."],
    },
    {
      kind: "thinking",
      label: "Thinking about",
      detail: [
        "VoxesDen, an idea for voice actors: voice cards to send to casting directors, played right in the browser. I haven't started building it. I'm still working out how it could actually help the voice acting industry, which matters more than how to build it.",
      ],
    },
    {
      kind: "off",
      label: "Off the clock",
      detail: [
        "Coffee, Checkers the cat, and 3D printing, mostly parts for electronics projects.",
        "And Linux, currently CachyOS with Niri. Tinkering with the desktop is a rabbit hole I've made peace with.",
      ],
    },
  ] as NowItem[],
};
