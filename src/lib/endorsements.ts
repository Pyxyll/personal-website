// What other people have said about my work, in their words.
//
// Nothing renders until `approved` is true. That flag means the person has
// said yes to their words being quoted here, with their name on them. A
// public comment elsewhere is not the same thing as permission to put it on
// this site.
//
// Quote exactly. Trimming the end of a sentence is fine; rewording is not.

export interface Endorsement {
  quote: string;
  name: string;
  /** Their role, and where you worked together. */
  role: string;
  approved: boolean;
}

export const endorsements: Endorsement[] = [
  {
    // From Niamh's comment on the award post, Nov 2026.
    quote:
      "Your technical ability is incredible, but it's your curiosity, your problem-solving and your ability to see the bigger picture that really set you apart.",
    // Approved by Niamh for this site, Nov 2026. "Manager" rather than her
    // job title: it says what her view is worth, and stays true after she
    // moves on.
    name: "Niamh Cooney",
    role: "Manager, The B!G Idea",
    approved: true,
  },
];

/** The ones cleared to show. */
export const approvedEndorsements = endorsements.filter((e) => e.approved);
