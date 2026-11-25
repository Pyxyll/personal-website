# dylancollins.me

Personal site. Astro, Tailwind, a single shader for the hero.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # writes ./dist
npm run preview  # serve ./dist locally
```

Content lives in `src/content/writing/` and `src/content/work/` as `.mdx` files. Add a file, push, done.

The rest is data, one file each:

- `src/lib/skills.ts` is what I do. It feeds the homepage plate, `/skills/` and the nav menu.
- `src/lib/cv.ts` is the CV. It feeds `/cv/` and the experience strip on the homepage.
- `src/lib/site.ts` holds the site-wide values, including `hiring.open`, the one switch that makes the site say I am looking.

```
npm run cv:pdf   # prints /cv/ to public/dylan-collins-cv.pdf with a local Chrome or Chromium
```

Run it after editing `cv.ts` and commit both, so the page and the PDF stay the same document.

Astro 7 needs Node 22.23.4 or newer.
