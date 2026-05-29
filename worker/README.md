# Contact form Worker

A Cloudflare Worker that receives contact-form submissions and sends two emails
via Resend: a notification to you (Reply-To = the sender) and a confirmation to
the sender. The main site stays fully static — this is the only dynamic piece.

Free on Cloudflare Workers (100k req/day, no card) and Resend (3k emails/mo).

## One-time setup

### 1. Verify the sending subdomain in Resend

1. Resend dashboard → **Domains** → **Add Domain** → `send.dylancollins.me`.
2. Resend shows a set of DNS records (MX, TXT/SPF, 3× CNAME for DKIM, optional
   DMARC). Add them to your DNS provider for the `send` subdomain.
3. Wait for Resend to mark the domain **Verified** (usually minutes).
4. Create an API key: **API Keys** → **Create** → copy it.

> The subdomain is the single domain you verify on the free tier. You never
> verify the root, so your `@dylancollins.me` inbox reputation stays separate.

### 2. Configure + deploy the Worker

```bash
cd worker
npm install
npx wrangler login                 # opens browser; free account, no card

# Set the Resend API key as a secret (never commit it):
npx wrangler secret put RESEND_API_KEY
# paste the key when prompted

npx wrangler deploy
```

`deploy` prints the Worker URL, e.g. `https://dylancollins-contact.<you>.workers.dev`.

### 3. Point the site at the Worker

Put that URL in `src/lib/site.ts` → `contactEndpoint`, then commit + push (Coolify
redeploys the site). The form will POST to it.

### 4. Check the addresses

`wrangler.toml` `[vars]` set the to/from addresses. Defaults:

- `TO_EMAIL`     — where notifications land (your real inbox)
- `FROM_NOTIFY`  — `contact@send.dylancollins.me`
- `FROM_CONFIRM` — `hello@send.dylancollins.me`

Edit them and re-run `wrangler deploy` if you want different addresses. The `from`
addresses must be on the verified subdomain.

## Local test

```bash
cd worker
npx wrangler dev          # runs the Worker locally
# in another shell, or via the site's `npm run dev`, submit the form
```

## Notes

- **Spam protection:** hidden honeypot field + per-IP rate limit (5/min) + length
  and email validation. Add Cloudflare Turnstile later if bots get clever.
- **CORS:** allowed origins are hard-coded in `src/index.js` (`ALLOWED_ORIGINS`).
  Update them if the site's domain changes.
- **Custom route (optional):** to use `https://contact.dylancollins.me` instead of
  the `workers.dev` URL, move the domain's DNS to Cloudflare and add a route in
  `wrangler.toml`. Not required.
