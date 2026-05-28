# Deploy — Coolify

This is a static Astro site. The Dockerfile builds it and serves the output
with nginx. No database, no runtime env vars at request time.

## In Coolify

1. New **Application** → source: this Git repo, branch `master`.
2. Build pack: **Dockerfile** (auto-detected).
3. Port: `80`.
4. Domain: `dylancollins.me` (and `www.dylancollins.me` → redirect).
5. Enable HTTPS (Let's Encrypt).

No env vars required for the static site itself. The contact form posts to
Formspree (or your provider of choice) directly from the browser — replace the
`action="https://formspree.io/f/REPLACE_ME"` endpoint in `src/pages/contact/index.astro`
with your real one.

## Local

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # writes ./dist
npm run preview      # serve ./dist locally on :4321
```

## Build it the way Coolify will

```bash
docker build -t dylancollins-me .
docker run --rm -p 8080:80 dylancollins-me
# http://localhost:8080
```
