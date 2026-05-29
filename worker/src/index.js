// Contact-form mailer. A single edge handler: validates the submission, then
// calls Resend's REST API twice: a notification to the site owner (with the
// sender's address as Reply-To, so replying in your inbox goes straight back
// to them) and a confirmation to the sender. No framework, no SDK, no deps.
//
// Secrets / vars (see wrangler.toml + `wrangler secret put`):
//   RESEND_API_KEY  (secret)  Resend API key
//   TO_EMAIL        (var)     inbox that receives notifications
//   FROM_NOTIFY     (var)     "Name <addr@send.dylancollins.me>" for the notification
//   FROM_CONFIRM    (var)     "Name <addr@send.dylancollins.me>" for the confirmation
//   RATE_LIMITER    (binding, optional) Cloudflare Rate Limiting binding

const ALLOWED_ORIGINS = [
  "https://dylancollins.me",
  "https://www.dylancollins.me",
  "http://localhost:4321",
];

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const cors = (origin) => {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

async function sendEmail(env, payload) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") ?? "";
    const headers = cors(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);

    // Per-IP rate limit (graceful no-op if the binding isn't configured).
    if (env.RATE_LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") ?? "anon";
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return json({ error: "Too many messages. Try again in a minute." }, 429, headers);
      }
    }

    // Accept JSON (the enhanced fetch path) or form-encoded (no-JS fallback).
    let data;
    try {
      const ct = request.headers.get("Content-Type") ?? "";
      if (ct.includes("application/json")) {
        data = await request.json();
      } else {
        data = Object.fromEntries(await request.formData());
      }
    } catch {
      return json({ error: "Could not read submission." }, 400, headers);
    }

    // Honeypot: real users never fill the hidden `company` field. If it's set,
    // silently accept (so the bot thinks it succeeded) and drop the message.
    if (data.company) return json({ ok: true }, 200, headers);

    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    const message = String(data.message ?? "").trim();

    if (!name || !email || !message) {
      return json({ error: "Please fill in name, email, and message." }, 400, headers);
    }
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      return json({ error: "That's a bit long. Please trim it down." }, 400, headers);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "That email doesn't look right." }, 400, headers);
    }

    // 1) Notification to the owner: Reply-To is the sender, so you reply directly.
    const notify = await sendEmail(env, {
      from: env.FROM_NOTIFY,
      to: [env.TO_EMAIL],
      reply_to: email,
      subject: `New enquiry from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px">
          <p style="color:#666;font-size:13px;text-transform:uppercase;letter-spacing:1px">New enquiry</p>
          <p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
          <p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</p>
        </div>`,
    });

    if (!notify.ok) {
      const detail = await notify.text().catch(() => "");
      console.error("Resend notification failed:", notify.status, detail);
      return json({ error: "Something went wrong sending your message." }, 502, headers);
    }

    // 2) Confirmation to the sender: best-effort; don't fail the request if it errors.
    ctx.waitUntil(
      sendEmail(env, {
        from: env.FROM_CONFIRM,
        to: [email],
        reply_to: env.TO_EMAIL,
        subject: "Thanks for reaching out",
        text: `Hi ${name},\n\nThanks for getting in touch. Your message landed and I'll get back to you within a couple of days.\n\nFor reference, here's what you sent:\n\n${message}\n\nDylan`,
        html: `
          <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;line-height:1.6">
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thanks for getting in touch. Your message landed and I'll get back to you within a couple of days.</p>
            <p style="color:#666">For reference, here's what you sent:</p>
            <blockquote style="border-left:2px solid #da2862;padding-left:12px;color:#444;white-space:pre-wrap">${escapeHtml(message)}</blockquote>
            <p>Dylan</p>
          </div>`,
      }).catch((e) => console.error("Confirmation email failed:", e))
    );

    return json({ ok: true }, 200, headers);
  },
};
