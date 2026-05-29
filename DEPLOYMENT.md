# Deploy — Coolify

This is a static Astro site. The Dockerfile builds it and serves the output
with nginx. No database, no runtime env vars at request time.

## Pipeline at a glance

```
push to main
   │
   ├─→ GitHub Actions (.github/workflows/ci.yml): astro check   ← type gate, non-blocking
   │
   └─→ Coolify git webhook → docker build (npm ci + astro build) → deploy
                                          └─ a failed build keeps the last good version live
```

Coolify's Dockerfile build *is* the deploy gate — if `astro build` fails, the
deploy fails and the previous version stays up. GitHub Actions only runs
`astro check` (TypeScript + template errors), which the Docker build doesn't do.
It reports status on the commit but does not block or trigger the deploy.

## First-time Coolify setup

1. New **Application** → **Public/Private Repository** → connect this Git repo.
2. Branch: `main`.
3. Build pack: **Dockerfile** (auto-detected).
4. Base directory: `/` (repo root — *not* `/frontend`, that was the old stack).
5. Port: `80`.
6. Domain: `dylancollins.me` (+ `www.dylancollins.me` → redirect to apex).
7. Enable HTTPS (Let's Encrypt).
8. **Enable "Auto Deploy"** — Coolify registers a GitHub webhook so every push
   to `main` redeploys automatically. No GitHub Actions secret or token needed
   for this; Coolify owns the webhook.

### Migrating from the old stack

The old Coolify project had three services — delete them:

- **PostgreSQL** database — delete.
- **Laravel backend** application — delete.
- **Next.js frontend** application — either delete and recreate per the steps
  above, or edit it: change base directory `/frontend` → `/`, port `3000` → `80`,
  and remove every environment variable.

No data to migrate (the old DB held no production content).

## Env vars

None required for the static site. The contact form posts to Formspree (or your
provider of choice) directly from the browser — replace the
`action="https://formspree.io/f/REPLACE_ME"` endpoint in
`src/pages/contact/index.astro` with your real one.

## Content workflow

```bash
npm run new          # scaffold a writing/work .mdx with correct frontmatter
# …write the body in your editor…
git commit && git push   # Coolify rebuilds + redeploys
```

New writing posts are created with `draft: true` — flip to `draft: false` in the
frontmatter to publish.

## Local

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # writes ./dist
npm run preview      # serve ./dist locally on :4321
npm run check        # astro check (same as CI)
```

## Build it the way Coolify will

```bash
docker build -t dylancollins-me .
docker run --rm -p 8080:80 dylancollins-me
# http://localhost:8080
```
