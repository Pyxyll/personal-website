import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/work" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    /** One short line for tight spots like the nav menu, where the summary
        would be cut off mid-sentence. Falls back to the summary. */
    tagline: z.string().max(60).optional(),
    category: z.string(),
    role: z.string().optional(),
    publishedAt: z.coerce.date(),
    stack: z.array(z.string()).default([]),
    url: z.url().optional(),
    repo: z.url().optional(),
    /** Up to three 16:10 screenshots, shown as a stack on the homepage. */
    images: z.array(image()).max(3).optional(),
    /** Up to four figures for the lead card on the homepage, where there are
        no screenshots to show: a short value and what it counts. */
    highlights: z
      .array(z.object({ value: z.string().max(5), label: z.string().max(24) }))
      .max(4)
      .optional(),
    /** Position among the four on the homepage: 1 leads. Entries without one
        fill the remaining places, newest first. */
    featured: z.number().int().positive().optional(),
  }),
});

export const collections = { work };
